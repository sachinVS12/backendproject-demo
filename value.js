const winston = require('winston');
const connectdb = require("./db/env");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const fileupload = require("express-fileupload");
const cookieparser = require("cookieparser");
const errorhnadler = require("./middlewre/error");
const dotenv = require("dotenv");
const authRouters = require("./Routers/authRouters");
const mqttRouters = require("./Routers/mqttRouters");
const supportemailRouters = require("./Routers/supportemailRouters");
const backupdbRouters = require("./Routers/backupdbRouters");

//Load environment vaiable
dotenv.config({path:"./.env"});

//Intialize express
const app = express();

//Logger configuration
const logger = winston.createlogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamps(),
        winston.format.json(),
    ),
    transports: [
        new winston.transports.File({filename: "error.log", level: "error"}),
        new winston.transports.File({fielname: "combined.log"}),
    ],
});

//Middleware
app.use(express.json());
app.use(fileupload());
app.use(express.urlencoded({extended:false}));
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        exposedHeaders: ["Content-length", "Content-dispostion"],
        maxAge:86400
    }));
app.use(cookieparser());

//Increase request to timeout and enable chunkked responses
app.use((req, res, next)=>{
    req.setTimeout(60000);
    res.setTimeout(60000);
    res.flush = res.flush || (()=>{});
    logger.info(`Request to set ${req.url}`,{
        method: req.method,
        body: req.body,
    });
    next();
});

//Routers
app.use("api/v1/auth", authRouters);
app.use("api/v1/mqtt", mqttRouters);
app.use("api/v1/supportemail", supportemailRouters);
app.use("api/v1/backupdb", backupdbRouters);

//errorHnadler
app.use(errorhnadler());

//Database Conncetion
connectdb();

//Start the Server
const port = process.env.port || 5000;
app.listen(port , "0.0.0.0",()=>{
    logger.info(`API server running on port`);
});