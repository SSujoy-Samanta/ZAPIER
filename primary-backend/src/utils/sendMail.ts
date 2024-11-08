import nodemailer from 'nodemailer';
const transport=nodemailer.createTransport({
    service:'gmail',
    port:465,
    secure:true,
    auth:{
        user:process.env.MAIL_ACC,
        pass:process.env.ACC_PASS
    }
})

export async function sendEmail(otp:string,To:string) {
    try {
        const receiver={
            from:process.env.MAIL_ACC,
            to:To,
            subject:"EMAIL VERIFICATION",
            text:`Your Verification otp: ${otp} ; Please don't share with anyone.`
        }
        await transport.sendMail(receiver,(e,info)=>{
            if(e){
                console.log(e);
            }else{
                console.log(`Email send to ${info.response} `)
            }
        })
    } catch (e) {
        console.log('Error occurred:', e);
        throw new Error('Failed to send email');
    }
}
