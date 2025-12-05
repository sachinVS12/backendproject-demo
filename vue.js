const mqtt = require("mqtt");

const YOUR_LOCAL_IP = "192.168.1.231";  // SAME AS ABOVE

const client = mqtt.connect(`mqtt://${YOUR_LOCAL_IP}:1883`);

client.on("connect", () => {
    console.log("Publisher connected to local MQTT broker");
});