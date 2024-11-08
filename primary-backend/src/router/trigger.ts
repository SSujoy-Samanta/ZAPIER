import { Router } from "express";
import { authMiddleware } from "./middleWare";
import { client } from "../db";

const router=Router();
router.get("/available",authMiddleware,async(req,res)=>{
    const availableTriggers=await client.availableTriggers.findMany({});
    return res.json({
        availableTriggers
    })
})

export const triggerRouter=router;