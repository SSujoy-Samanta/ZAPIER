import { Router } from "express";
import { authMiddleware } from "./middleWare";
import { client } from "../db";


const router=Router();

router.get("/available",authMiddleware,async(req,res)=>{
    const availableActions=await client.availableActions.findMany({});
    return res.status(200).json({
        availableActions
    })
})

export const actionRouter=router;