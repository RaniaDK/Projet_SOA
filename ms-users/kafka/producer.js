const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'ms-users',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
});

const producer = kafka.producer();
let connected = false;

async function connectProducer() {
  if (!connected) {
    await producer.connect();
    connected = true;
    console.log('[Kafka] Producer ms-users connecté');
  }
}

async function publishUserRegistered(user) {
  await connectProducer();
  await producer.send({
    topic: 'user.registered',
    messages: [
      {
        key: user.id,
        value: JSON.stringify({
          userId: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.created_at,
        }),
      },
    ],
  });
  console.log(`[Kafka] Événement user.registered publié pour userId=${user.id}`);
}

module.exports = { publishUserRegistered };
