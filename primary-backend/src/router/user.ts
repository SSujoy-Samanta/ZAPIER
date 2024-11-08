import { Router } from "express";
import { authMiddleware } from "./middleWare";
import { signInSchema, signUpSchema } from "../types/schema";
import { client } from "../db";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_PASSWORD } from "../config";
import { sendEmail } from "../utils/sendMail";
import { OTP_GEN } from "../utils/otp-gen";

const router=Router();

router.post("/signup",async(req,res)=>{
    const body=req.body;
    const parseSchema=signUpSchema.safeParse(body);
    if(!parseSchema.success){
        return res.status(411).json({
            message:"incorrect inputs"
        })
    }
    const exits=await client.user.findFirst({
        where:{
            email:parseSchema.data?.email
        }
    })
    if(exits){
        return  res.status(403).json({
            message:"Email already exists"
        })
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(parseSchema.data.password, salt);
    const newUser=await client.user.create({
        data:{
            name:parseSchema.data.username,
            email:parseSchema.data.email,
            password:hashedPassword
        }
    })
    //await verifyEmail()
    const Otp=OTP_GEN(5);
    await sendEmail(Otp,newUser.email);
    await client.otp.create({
        data:{
            OTP: parseInt(Otp),
            created: new Date(),
            expired: new Date(new Date().getTime() + 60 * 1000), 
            userId:newUser.id
        }
    })
    return res.json({
        message:"user created successfully & otp sent"
    })
})
router.post("/signin",async(req,res)=>{
    const body =req.body;
    const parseSignIn=signInSchema.safeParse(body);
    if(!parseSignIn.success){
        return res.status(411).json({
            msg:"invalid inputs"
        })
    }
    const user = await client.user.findUnique({
        where: { 
            email:parseSignIn.data?.email,
            verified:true
        }
    });
    if(!user){
        return res.status(403).json({
            msg:"Verify your email account. "
        })
    }
    const isMatch = await bcrypt.compare(parseSignIn.data.password, user.password);
    if(!isMatch){
        return res.status(403).json({
            msg:"Invalid password"
        })
    }
    await client.user.update({
        where:{
            email:parseSignIn.data?.email
        },
        data:{
            is_loggedIn:true
        }
    })
    //jwt token
    const token=jwt.sign({
        id:user.id
    },JWT_PASSWORD)
    res.json({
        token:token
    })
})

router.get("/",authMiddleware,async(req,res)=>{
    //@ts-ignore
    const id=req.id;
    console.log("id:"+id)
    const user=await client.user.findFirst({
        where:{
            id:id
        },
        select:{
            email:true,
            name:true,
        }
    })
    console.log(user);
    res.send({
        user
    });
})
router.get("/isloggedIn",async(req,res)=>{
    //@ts-ignore
    const email=req.params;
    const user=await client.user.findFirst({
        where:{
            email:email
        },
        select:{
            is_loggedIn:true
        }
    })
    const isLoggedIn=user?.is_loggedIn
    res.send({
        isLoggedIn
    });
})
router.post("/isloggedout",authMiddleware,async(req,res)=>{
    //@ts-ignore
    const id=req.id;
    const user=await client.user.update({
        where:{
            id:id
        },
        data:{
            is_loggedIn:false
        }
       
    })
    
    res.send({
       
    });
})


export const userRouter=router;