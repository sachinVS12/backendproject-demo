// const mqtt = require("mqtt");

// // connect to broker
// const client = mqtt.connect("mqtt://test.mosquitto.org"); 
// // use your broker if different

// client.on("connect", () => {
//     console.log("Publisher connected to MQTT broker");

//     // data you want to send
//     const message = {
//         temperature: 25,
//         humidity: 60,
//         status: "OK"
//     };

//     // publish to topic
//     client.publish("my/home/data", JSON.stringify(message), () => {
//         console.log("Message published:", message);
//         client.end(); // close connection
//     });
// });

const mqtt = require("mqtt");

// connect to broker
const client = mqtt.connect("mqtt://test.mosquitto.org");

const TOTAL_MESSAGES = 200;

client.on("connect", () => {
    console.log("Publisher connected to MQTT broker");

    for (let i = 1; i <= TOTAL_MESSAGES; i++) {
        const message = {
            index: i,
            temperature: Math.floor(Math.random() * 40),
            humidity: Math.floor(Math.random() * 100),
            status: "OK"
        };

        client.publish("my/home/data", JSON.stringify(message), () => {
            if (i % 20 === 0) {
                console.log(`Published ${i} messages`);
            }
        });
    }

    // close connection after a short delay to ensure all messages are sent
    setTimeout(() => {
        console.log(`Finished publishing ${TOTAL_MESSAGES} messages`);
        client.end();
    }, 1000);
});
