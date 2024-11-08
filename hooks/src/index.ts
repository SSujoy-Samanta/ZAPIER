import express from "express";
import { PrismaClient } from "@prisma/client";

const app=express();
const db=new PrismaClient();
app.use(express.json());

app.post("/hooks/catch/:userId/:zapId",async(req,res)=>{
    const userId=req.params.userId;
    const zapId=req.params.zapId;
    const body=req.body;

    await db.$transaction(async ts =>{
        const run=await ts.zapRun.create({
            data:{
                zapId:zapId,
                metadata:body
            }
           
        });
        await ts.zapRunOutBox.create({
            data:{
                zapRunId:run.id,
            }
         
        })
    });
    res.send({
        msg:"Webhook Recived."
    });

})
app.listen(3000,()=>{
    console.log("Listining port 3000");
});




//https://hooks.zapier.com/hooks/catch/19664233/26u0j9t/








