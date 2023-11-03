import express,{Router} from "express";
import ServerlessHttp from "serverless-http";

const router=Router();

const app=express();

router.get("/",(req,res)=>{
    res.send("Hi");
})
router.get("/hello",(req,res)=>{
    res.send("hello");
})
app.use("/api/",router);

module.exports.handler=ServerlessHttp(app);