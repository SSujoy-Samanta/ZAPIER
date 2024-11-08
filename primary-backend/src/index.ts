require('dotenv').config();
import express from "express";
import { userRouter } from "./router/user";
import { zapRouter } from "./router/zap";
import cors from "cors";
import { triggerRouter } from "./router/trigger";
import { actionRouter } from "./router/actions";
import { otpRouter } from "./router/otp";
const app=express();
app.use(express.json());
app.use(cors());

app.use("/app/v1/user",userRouter);
app.use("/app/v1/zap",zapRouter);
app.use("/app/v1/triggers",triggerRouter);
app.use("/app/v1/actions",actionRouter);
app.use("/app/v1/otp",otpRouter);



app.listen(8080,()=>{
    console.log("listening port 8080");
})