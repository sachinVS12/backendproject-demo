const mqtt = require('mqtt');
const MqttData = require('./models/MqttData');

const broker = 'mqtt://192.168.1.232:1883';
const options = {
    username: 'Sarayu',
    password: 'IOTteam@123'
};

// Subscribe wildcard for all companies, all topics
const topic = '+/d/#';

const client = mqtt.connect(broker, options);

client.on('connect', ()=>{
    console.log('Mqtt connected');
    client.subscribe(topic, (err) => {
        if (err) {
            console.error('Subscription error:', err);
        } else {
            console.log(`Subscribe to ${topic}`);
        }
    });
});

client.on('message', async (topic, message) => {
    try {
        const payload = message.toString();

        // Example topic: companyone/d1/topic|m/s
        const [company, device, topicName] = topic.split('/');

        const data = new MqttData({
            company,
            device,
            topic: topicName,
            value: payload
        });

        await data.save();
        console.log(`Saved: ${topic} => ${payload}`);
    } catch (err) {
        console.error('Error saving data:', err);
    }
});