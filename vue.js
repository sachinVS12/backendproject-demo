const winston = require("winston");
const connectdb = require("./eb/env");
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieparser = require("cookieparser");
const fileupload = require('express-fileupload');
const errorHandler = require("./middleware/error");
const dotenv = require("dotenv");
const authrouters = require("./routers/authrouters");
const mqttrouters = require("./routers/mqtrouters");
const supportemailrouters = require("./routers/supportemailrouters");
const backupdbrouters = require("./routers/backupdbrouters");

//enviroment load variable
dotenv.config({path: "./.env"});

//initialize express
const app = express();

//logger configuration
const logger = winston.create.logger({
    level: "info",
    format: winston.combine(
        winston.format.timestamps(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({fielname: "error.log", level: "error"}),
        new winston.transports.File({filename: "combined.log"}),
    ],
});

//middleware
app.use(express.json());
app.use(fileupload());
app.use(express.urlencoded({extended: false}));
app.use(
    cors({
        origin: "*",
        methdods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        exposedHeaders: ['contentent: length', "contentent-dispostion"],
        maxAge:86400
    }));
    app.use(cookieparser());

//increase to timeout and enabled chunkked responses
app.use((req, res, next)=>{
    req.setTimeout(60000); //10 minutes timeout
    res.setTimeout(60000); //10 minutes timeout
    res.flush = res.flush || (()=>{});//enusre flush is availbel
})