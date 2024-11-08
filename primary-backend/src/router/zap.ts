import { Router } from "express";
import { authMiddleware } from "./middleWare";
import { zapCreateSchema } from "../types/schema";
import { client } from "../db";
const router=Router();
router.post("/",authMiddleware,async(req,res)=>{
    const body=req.body;
    //@ts-ignore
    const id=req.id;
    const parseZap=zapCreateSchema.safeParse(body);
    if(!parseZap.success){
        return res.status(411).json({
            msg:"wrong Inputs"
        })
    }
    const zapId=await client.$transaction(async tx =>{
        const zap=await tx.zap.create({
            data:{
                userId:parseInt(id),
                triggerId:"",
                actions:{
                    create:parseZap.data.availableActions.map((x,index)=>({
                        actionId:x.actionId,
                        metaData:x.actionMetaData,
                        sortingOrder:index
                    }))
                }
            }
        })
        const trigger=await tx.trigger.create({
            data:{
                triggerId:parseZap.data.availableTriggerId,
                zapId:zap.id
            }
        })
        await tx.zap.update({
            where:{
                id:zap.id
            },
            data:{
                triggerId:trigger.id
            }
        })
        return zap.id;
    })
    res.status(200).json({zapId})
})
router.get("/",authMiddleware,async(req,res)=>{
    //@ts-ignore
    const id=req.id;
    const zaps=await client.zap.findMany({
        where:{
            userId:id
        },
        include:{
            actions:{
                include:{
                    type:true
                }
            },
            trigger:{
                include:{
                    type:true
                }
            }
        }
    })
    return res.status(200).json({
        zaps
    })
})
router.get("/:zapId",authMiddleware,async(req,res)=>{
    //@ts-ignore
    const id=req.id;
    const zapId=req.params.zapId;
    //console.log(zapId)
    const zap=await client.zap.findFirst({
        where:{
            userId:id,
            id:zapId
        },
        include:{
            actions:{
                include:{
                    type:true
                }
            },
            trigger:{
                include:{
                    type:true
                }
            }
        }
    })
    return res.json({
        zap
    })
})

export const zapRouter=router;