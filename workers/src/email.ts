require('dotenv').config();
import nodemailer from "nodemailer"
const transport=nodemailer.createTransport({
    host:process.env.SMTP_URL,
    port:587,
    secure:false,
    auth:{
        user:process.env.SMTP_USER,
        pass:process.env.SMTP_PASS
    }
})
export const EmailSender=async(to:string,body:string)=>{
    await transport.sendMail({
        from:"sujoysamanata5317@gamil.com",
        to:to,
        subject:"HELLO FROM ZAPIER BY SUJOY",
        text:body
    },(e,info)=>{
        if(e){
            console.log(e);
        }else{
            console.log(`Email send to ${info.response} `)
        }
    })
}