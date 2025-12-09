// const mqtt = require("mqtt");

// const YOUR_LOCAL_IP = "192.168.1.231";  // SAME AS ABOVE

// const client = mqtt.connect(`mqtt://${YOUR_LOCAL_IP}:1883`);

// client.on("connect", () => {
//     console.log("Publisher connected to local MQTT broker");

//     // Send data every 3 seconds
//     setInterval(() => {
//         const message = {
//             temperature: (Math.random() * 10 + 20).toFixed(2),
//             humidity: (Math.random() * 40 + 40).toFixed(2),
//             status: Math.random() > 0.8 ? "WARNING" : "OK",
//             device: "d1",
//             timestamp: new Date().toISOString()
//         };

//         const payload = JSON.stringify(message);

//         client.publish("sarayu/d1/topic", payload, { qos: 1 }, () => {
//             console.log("Published:", message);
//         });
//     }, 3000); // every 3 seconds
// });

// client.on("error", (err) => {
//     console.log("MQTT Publish Error:", err);
// });



// publish.js - MQTT Publisher for The Things Network (TTI/TTN v3)

const mqtt = require("mqtt");

// ===== TTN MQTT Broker Details (Same as your receiver) =====
const BROKER_HOST = "as1.cloud.thethings.industries";  // Europe 1 cluster
const BROKER_PORT = 1883;

// ===== Your Application and Device Credentials from TTN Console =====
const MQTT_USERNAME = "sarayu001@sarayuinfotech";                    // Application ID
const MQTT_PASSWORD = "NNSXS.V5E2C2YNW4N3N5QAQIFERVJFUTARAZVSOF56ETY.JT4DV7RZX33XO2UV7I6T3QMJ6P272OUIMCOYJYB5VDTLQIGNGQSA"; // API Key

// ===== Uplink Topic Format for TTN v3 =====
// For device "d1 in application sarayu001 → topic will be:
// v3/sarayu001@ttn/devices/d1/up
const TOPIC = "v3/sarayu001@ttn/devices/d1/up";

const client = mqtt.connect(`mqtt://${BROKER_HOST}:${BROKER_PORT}`, {
    username: MQTT_USERNAME,
    password: MQTT_PASSWORD,
    reconnectPeriod: 3000,
    connectTimeout: 30 * 1000,
    keepalive: 60,
    clean: true
});

client.on("connect", () => {
    console.log("Publisher connected to TTN MQTT broker");

    // Publish simulated uplink every 5 seconds
    setInterval(publishUplink, 5000);
    publishUplink(); // Send one immediately
});

client.on("error", (err) => {
    console.error("MQTT Connection Error:", err.message);
});

client.on("offline", () => {
    console.log("Publisher went offline");
});

client.on("reconnect", () => {
    console.log("Trying to reconnect...");
});

// ===== Simulate TTN Uplink Payload (Base64 encoded) =====
function publishUplink() {
    const temperature = (Math.random() * 10 + 20).toFixed(2);
    const humidity = (Math.random() * 40 + 40).toFixed(2);
    const status = Math.random() > 0.8 ? "WARNING" : "OK";

    // This is how real LoRaWAN devices send data: base64 encoded bytes in "payload_raw"
    const data = {
        temperature: parseFloat(temperature),
        humidity: parseFloat(humidity),
        status: status,
        device: "d1",
        timestamp: new Date().toISOString()
    };

    // Convert JSON → Buffer → Base64 (exactly like real device)
    const payload_raw = Buffer.from(JSON.stringify(data)).toString("base64");

    const message = {
        app_id: "sarayu001",
        dev_id: "d1",
        hardware_serial: "0102030405060708", // optional
        port: 1,
        counter: Math.floor(Math.random() * 1000),
        payload_raw: payload_raw,
        metadata: {
            time: new Date().toISOString(),
            frequency: 865.402875,
            modulation: "LORA",
            data_rate: "SF7BW125",
            coding_rate: "4/5",
            gateways: [
                {
                    gtw_id: "eui-b827ebfffe123456",
                timestamp: Date.now() * 1000,
                rssi: -65,
                snr: 8.5
                }
            ]
        }
    };

    client.publish(TOPIC, JSON.stringify(message), { qos: 1 }, (err) => {
        if (!err) {
            console.log("Published uplink →", data);
        } else {
            console.error("Publish failed:", err);
        }
    });
}