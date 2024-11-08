import { Request,Response,NextFunction } from "express"
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "../config";
export const authMiddleware=(req:Request,res:Response,next:NextFunction)=>{
    const token=req.headers.authorization as unknown as string;
    try {
        const payload=jwt.verify(token,JWT_PASSWORD);
        //@ts-ignore
        req.id=payload.id;
        next();

    } catch (error) {
        res.status(403).json({
            msg:"you are not login"
        })
    }
}