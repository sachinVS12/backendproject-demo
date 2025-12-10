const mqtt = require("mqtt");

const YOUR_LOCAL_IP = "as1.cloud.thethings.industries";  // SAME AS ABOVE

const client = mqtt.connect(`mqtt://${YOUR_LOCAL_IP}:1883`);

client.on("connect", () => {
    console.log("Publisher connected to local MQTT broker");

    // Send data every 3 seconds
    setInterval(() => {
        const message = {
            temperature: (Math.random() * 10 + 20).toFixed(2),
            humidity: (Math.random() * 40 + 40).toFixed(2),
            status: Math.random() > 0.8 ? "WARNING" : "OK",
            device: "d1",
            timestamp: new Date().toISOString()
        };

        const payload = JSON.stringify(message);

        client.publish("sarayu/d1/topic", payload, { qos: 1 }, () => {
            console.log("Published:", message);
        });
    }, 3000); // every 3 seconds
});

client.on("error", (err) => {
    console.log("MQTT Publish Error:", err);
});