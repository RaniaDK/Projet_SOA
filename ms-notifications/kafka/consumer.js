const { Kafka } = require('kafkajs');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/init');

const kafka = new Kafka({
  clientId: 'ms-notifications',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'notifications-group' });

const MESSAGES = {
  'reservation.created': (data) =>
    `Votre réservation pour la chambre "${data.roomName}" est confirmée du ${data.checkIn} au ${data.checkOut}.`,
  'reservation.cancelled': (data) =>
    `Votre réservation (ID: ${data.bookingId}) a été annulée.`,
  'user.registered': (data) =>
    `Bienvenue ${data.name} ! Votre compte HotelSync a été créé avec succès.`,
};

async function startConsumer() {
  await consumer.connect();
  console.log('[Kafka] Consumer ms-notifications connecté');

  await consumer.subscribe({
    topics: ['reservation.created', 'reservation.cancelled', 'user.registered'],
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      try {
        const data = JSON.parse(message.value.toString());
        const userId = data.userId || data.userId;
        const buildMsg = MESSAGES[topic];
        if (!buildMsg || !userId) return;

        const db = await getDb();
        await db.notifications.insert({
          id:         uuidv4(),
          user_id:    userId,
          type:       topic,
          message:    buildMsg(data),
          read:       false,
          created_at: new Date().toISOString(),
        });
        console.log(`[Kafka] Notification créée — topic=${topic} userId=${userId}`);
      } catch (err) {
        console.error('[consumer eachMessage]', err.message);
      }
    },
  });
}

module.exports = { startConsumer };