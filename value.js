const winston = require("winston");
const connectdb = require("./env/db");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieparser = require("cookieparser");
const fileupload = require("express-fileupload");
const errorhandler = require("./middleware/error");
const dotenv = require("dotenv");
const authRouters = require('./Routers/authRouters');
const mqttRouters = require("./Routers/mqttRouters");
const supportemailRouters = require("./Routers/supportemailRouters");
const backupdbRouters = require("./Routers/backupdbrouters");

//Load environment variable
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
    transports:[
        new winston.transports.File({filename: "error.log", level:"error"}),
        new winston.transports.File({filename: "combine.log"}),
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
        exposedHeaders: ["Content-Length", "Content-dispostion"],
        maxage: 86400
    }));
app.use(cookieparser());

//Increase request to timeout and enable chunnked response
app.use((req, res, next)=>{
    req.setTimeout(60000);
    res.setTimeout(60000);
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
app.use('api/v1/backupdb', backupdbRouters);

//errorhandler
app.use(errorhandler());

//Database Connection
connectdb();

//Start the Server
const port = process.env.port || 5000;
app.listen(port, "0.0.0.0", (()=>{
    logger.info(`api server running on port ${port}`);
}));