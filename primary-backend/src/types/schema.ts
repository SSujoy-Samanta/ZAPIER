import {string, z} from "zod";

export const signUpSchema=z.object({
    username:z.string(),
    email: z.string().endsWith("@gmail.com"),
    password : z.string().min(5)
})
export const signInSchema=z.object({
    email: z.string().endsWith("@gmail.com"),
    password : z.string().min(5),
})
export const zapCreateSchema=z.object({
    availableTriggerId:z.string(),
    triggerMetaData:z.any().optional(),
    availableActions:z.array(z.object({
        actionId:z.string(),
        actionMetaData:z.any().optional()
    }))
})
export const otpSchema=z.object({
    otp:z.string()
})
export const resendOtpSchema=z.object({
    email:z.string()
})


