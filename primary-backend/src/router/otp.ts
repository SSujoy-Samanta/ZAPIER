import { Router } from "express";
import { otpSchema, resendOtpSchema } from "../types/schema";
import { client } from "../db";
import { OTP_GEN } from "../utils/otp-gen";
import { sendEmail } from "../utils/sendMail";

const router =Router();

router.post('/resend',async(req,res)=>{
    const body=req.body;
    const parsedBody=resendOtpSchema.safeParse(body);
    if (!parsedBody.success) {
        return res.status(400).json({
            message: 'Invalid data for resend otp',
            errors: parsedBody.error.errors
        });
    }
    try{
        const user=await client.user.findFirst({
            where:{
                email:parsedBody.data.email
            }
        })
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }
        const newOTP=OTP_GEN(5)
        // Check if there is an existing OTP for this user
        const existingOtp = await client.otp.findFirst({
            where: {
                userId: user?.id
            }
        });
        if (existingOtp) {
            // Update the existing OTP record
            await client.otp.update({
                where: {
                    id: existingOtp.id
                },
                data: {
                  OTP:parseInt(newOTP),
                  created: new Date(),
                  expired: new Date(new Date().getTime() + 60 * 1000), 
                  userId:user.id

                }
            });
        } else {
            // Create a new OTP record
            await client.otp.create({
                data: {
                    OTP: parseInt(newOTP),
                    created: new Date(),
                    expired: new Date(new Date().getTime() + 60 * 1000),
                    userId:user.id
                }
            });
        }
        
        // Send the new OTP via email
        await sendEmail(newOTP,user.email);
        res.status(200).json({
            message: 'OTP resent successfully'
        });

    }catch(e){
        console.error('Error occurred:', e);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
});
router.post('/',async(req,res)=>{
    const body = req.body;
    // Validate request body
    const parseOtp = otpSchema.safeParse(body);
    if (!parseOtp.success) {
        return res.status(400).json({
            message: 'Invalid OTP data',
            errors: parseOtp.error.errors
        });
    }

    try {
        // Find the OTP in the database
        const foundOtp = await client.otp.findFirst({
            where: {
                OTP: parseInt(parseOtp.data.otp, 10) // Ensure the OTP is parsed as an integer
            }
        });

        if (foundOtp) {
            const expire = foundOtp.expired;
            const now = new Date();

            // Check if the OTP has expired
            if (expire <= now) {
                return res.status(411).json({
                    message: 'OTP expired'
                });
            }

            // OTP is valid and not expired, update the user
            await client.user.update({
                where: {
                    id: foundOtp.userId
                },
                data: {
                    verified: true // Mark the user as verified
                }
            });

            res.status(200).json({
                message: 'User verified successfully'
            });
        } else {
            // OTP not found
            res.status(404).json({
                message: 'OTP not matched'
            });
        }
    } catch (error) {
        console.error('Error occurred:', error);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }

})

export const otpRouter=router;