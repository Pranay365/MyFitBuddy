import express, { Router } from "express";
import ServerlessHttp from "serverless-http";

const router = Router();


router.get("/pello", (req, res) => {
  res.send("pello");
});


module.exports.handler = ServerlessHttp(app);
