const winston = require("winston");
const connectdb = require("./eb/env");
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieparser = require("cookieparser");
const fileupload = require('express-fileupload');
const errorHandler = require("./middleware/error");
const dotenv = require("dotenv");
const authRouters = require("./Routers/authRouters");
const mqttRouters = require("./Routers/mqttRouters");
const supportemailRouters = require("./Routers/supportemailRouters");
const backupdbRouters = require("./Routers/backupdbRouters");

//Enviroment load variable
dotenv.config({path: "./.env"});

//Initialize express
const app = express();

//Logger configuration
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

//Middleware
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

//Increase request to timeout and enabled chunkked responses
app.use((req, res, next)=>{
    req.setTimeout(60000); //10 minutes timeout
    res.setTimeout(60000); //10 minutes timeout
    res.flush = res.flush || (()=>{});//enusre flush is availble
    logger.info(`Request to url: ${req.url}`,{
        method: req.method,
        body: req.body,
    });
    next();
});

//Routers
app.use("api/v1/auth", authrouters);
app.use('api/v1/mqtt', mqttrouters);
app.use("api/v1/supportemail", supportemailrouters);
app.use("api/v1/backupdb", backupdbrouters);

//errorHnadler
app.use(errorHandler);

//DataBase Connection
connectdb();

//Start the Server
const port = process.env.port || 5000;
app.listen(port, "0.0.0.0", ()=>{
    logger.info(`API server running on port ${port}`);
});