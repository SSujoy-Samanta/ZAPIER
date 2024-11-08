import { PrismaClient } from "@prisma/client";
import {Kafka} from "kafkajs";
const db = new PrismaClient();
const TOPIC_NAME="zap-queue";
const kafka = new Kafka({
    clientId: 'out-box processors',
    brokers: ['localhost:9092']
})
const main=async()=>{
    const producer = kafka.producer();
    await producer.connect();
    while(1){
        const pending=await db.zapRunOutBox.findMany({
            where:{},
            take:10
        })
        producer.send({
            topic:TOPIC_NAME,
            messages:pending.map(e=>({
                value:JSON.stringify({zapRunId:e.zapRunId,stage:0})
            }))
            
        });
        await db.zapRunOutBox.deleteMany({
            where:{
                id:{
                    in:pending.map(r=>r.id)
                }
            }
        })
    }
}
main();