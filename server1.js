const express = require("express");
const mqtt = require("mqtt");
const mongoose = require("mongoose");

// ===== MongoDB Connection – CLEAN 2025 SYNTAX =====
mongoose.connect("mongodb://localhost:27017/mqttdata")
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.error("MongoDB connection error:", err));

// ===== Schema =====
const messageSchema = new mongoose.Schema({
    topic: String,
    payload: mongoose.Schema.Types.Mixed,
    timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model("Message", messageSchema);
// ===== Your Local IP =====
const YOUR_LOCAL_IP = "192.168.1.231";  // CHANGE THIS TO YOUR ACTUAL IP

// ===== MQTT Client (Subscriber) =====
const mqttClient = mqtt.connect(`mqtt://${YOUR_LOCAL_IP}:1883`);

mqttClient.on("connect", () => {
    console.log("MQTT Subscriber connected to local broker");

    mqttClient.subscribe("sarayu/d1/topic", (err) => {
        if (!err) {
            console.log("Subscribed to sarayu/d1/topic");
        } else {
            console.log("Subscribe error:", err);
        }
    });
});

mqttClient.on("message", async (topic, message) => {
    let payload;
    try {
        payload = JSON.parse(message.toString()); // parse JSON
    } catch (e) {
        payload = message.toString(); // fallback to string
    }

    console.log(`Received on ${topic}:`, payload);

    try {
        await Message.create({ topic, payload });
        console.log("Saved to MongoDB");
    } catch (err) {
        console.log("MongoDB save error:", err);
    }
});

mqttClient.on("error", (err) => {
    console.log("MQTT Error:", err);
});

// ===== Express API =====
const app = express();
app.use(express.json());

// Get all messages
app.get("/messages", async (req, res) => {
    try {
        const messages = await Message.find().sort({ timestamp: -1 }).limit(50);
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Optional: Get latest message
app.get("/latest", async (req, res) => {
    const latest = await Message.findOne().sort({ timestamp: -1 });
    res.json(latest || { message: "No data yet" });
});

const PORT = 3000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`API Server running at http://${YOUR_LOCAL_IP}:${PORT}`);
    console.log(`Open http://${YOUR_LOCAL_IP}:${PORT}/messages in browser`);
});