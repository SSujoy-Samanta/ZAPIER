require('dotenv').config();
import {Kafka} from "kafkajs";
import { db } from "./db/db";
import { JsonObject } from "@prisma/client/runtime/library";
import { parse } from "./parse";
import { EmailSender } from "./email";
const TOPIC_NAME="zap-queue";
const kafka = new Kafka({
    clientId: 'out-box processors',
    brokers: ['localhost:9092']
})

const main=async()=>{
    const consumer = kafka.consumer({ groupId: 'worker-main' });
    await consumer.connect()
    await consumer.subscribe({ topic: TOPIC_NAME, fromBeginning: true })
    const producer = kafka.producer();
    await producer.connect();

    await consumer.run({
        autoCommit:false,
        eachMessage: async ({ topic, partition, message }) => {
            console.log({
                partition,
                offset: message.offset,
                value: message.value?.toString(),
            });
            if(!message.value?.toString()){
                return ;
            }
            const parseValue=JSON.parse(message.value?.toString());
            const zapRunId=parseValue.zapRunId;
            const stage=parseValue.stage;
            
            const zapRunDetails=await db.zapRun.findFirst({
                where:{
                    id:zapRunId
                },
                include:{
                    zap:{
                        include:{
                            actions:{
                                include:{
                                    type:true
                                }
                            }
                        }
                    }
                }
            });
            const currAction=zapRunDetails?.zap.actions.find(a => a.sortingOrder=== stage);
            if(!currAction){
                console.log("Current actions not found");
                return;
            }
            if(currAction.type.id.toLocaleLowerCase()==="email"){
                const zapRunMetadata=zapRunDetails?.metadata;
                const body=parse((currAction.metaData as JsonObject)?.body as string,zapRunMetadata);
                const to=(currAction.metaData as JsonObject)?.email  as string; 
                console.log("Email Sent");
                await EmailSender(to,body);
            }
            if(currAction.type.id.toLocaleLowerCase()==="solana"){
                console.log("Solana Sent");
            }
            const lastStage=(zapRunDetails?.zap.actions.length || 1 ) - 1;
            if(lastStage!==stage){
                await producer.send({
                    topic:TOPIC_NAME,
                    messages:[{
                        value:JSON.stringify({
                            stage:stage+1,
                            zapRunId
                        })
                    }]
                    
                });
            }
            console.log("Processing Done!!!");
            await consumer.commitOffsets([{
                topic:TOPIC_NAME,
                partition:partition,
                offset:(parseInt(message.offset)+1).toString()
            }])
        },
    })

}
main();