const { connect } = require("mongoose");
const mqtt = require("mqtt");

const YOUR_LOCAL_IP = "192.168.1.232"; 

const client = mqtt.connect(`mqtt://${YOUR_LOCAL_IP}:1883`);

client.on("connect", ()=>{
    console.log("publisher connected to local MQTT broker");
});


