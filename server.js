const express = require("express");
const mqtt = require("mqtt");
const mongoose = require("mongoose");

// ===== MongoDB Connection =====
mongoose.connect("mongodb://localhost:27017/mqttdata")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB error:", err));

// ===== MongoDB Schema =====
const messageSchema = new mongoose.Schema({
    topic: String,
    payload: String,
    timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model("Message", messageSchema);

// ===== MQTT Client =====
const mqttClient = mqtt.connect("mqtt://test.mosquitto.org");  // change if using your own broker

mqttClient.on("connect", () => {
    console.log("MQTT connected");

    // subscribe to topic
    mqttClient.subscribe("my/home/data");
});

// handle incoming MQTT messages
mqttClient.on("message", async (topic, message) => {
    const payload = message.toString();
    console.log(`Received: ${topic} => ${payload}`);

    // save to MongoDB
    await Message.create({ topic, payload });
});

// ===== Express App =====
const app = express();

// get all MQTT messages stored in MongoDB
app.get("/messages", async (req, res) => {
    const messages = await Message.find().sort({ timestamp: -1 });
    res.json(messages);
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
