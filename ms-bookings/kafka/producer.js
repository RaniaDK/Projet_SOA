const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'ms-bookings',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
});

const producer = kafka.producer();
let connected = false;

async function connectProducer() {
  if (!connected) {
    await producer.connect();
    connected = true;
    console.log('[Kafka] Producer ms-bookings connecté');
  }
}

async function publishBookingCreated(booking) {
  await connectProducer();
  await producer.send({
    topic: 'reservation.created',
    messages: [
      {
        key: booking.id,
        value: JSON.stringify({
          bookingId: booking.id,
          userId:    booking.user_id,
          roomId:    booking.room_id,
          roomName:  booking.room_name,
          checkIn:   booking.check_in,
          checkOut:  booking.check_out,
          price:     booking.price,
        }),
      },
    ],
  });
  console.log(`[Kafka] reservation.created publié pour bookingId=${booking.id}`);
}

async function publishBookingCancelled(booking) {
  await connectProducer();
  await producer.send({
    topic: 'reservation.cancelled',
    messages: [
      {
        key: booking.id,
        value: JSON.stringify({
          bookingId: booking.id,
          userId:    booking.user_id,
          roomId:    booking.room_id,
          reason:    'Annulé par l\'utilisateur',
        }),
      },
    ],
  });
  console.log(`[Kafka] reservation.cancelled publié pour bookingId=${booking.id}`);
}

module.exports = { publishBookingCreated, publishBookingCancelled };const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'ms-bookings',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
});

const producer = kafka.producer();
let connected = false;

async function connectProducer() {
  if (!connected) {
    await producer.connect();
    connected = true;
    console.log('[Kafka] Producer ms-bookings connecté');
  }
}

async function publishBookingCreated(booking) {
  await connectProducer();
  await producer.send({
    topic: 'reservation.created',
    messages: [
      {
        key: booking.id,
        value: JSON.stringify({
          bookingId: booking.id,
          userId:    booking.user_id,
          roomId:    booking.room_id,
          roomName:  booking.room_name,
          checkIn:   booking.check_in,
          checkOut:  booking.check_out,
          price:     booking.price,
        }),
      },
    ],
  });
  console.log(`[Kafka] reservation.created publié pour bookingId=${booking.id}`);
}

async function publishBookingCancelled(booking) {
  await connectProducer();
  await producer.send({
    topic: 'reservation.cancelled',
    messages: [
      {
        key: booking.id,
        value: JSON.stringify({
          bookingId: booking.id,
          userId:    booking.user_id,
          roomId:    booking.room_id,
          reason:    'Annulé par l\'utilisateur',
        }),
      },
    ],
  });
  console.log(`[Kafka] reservation.cancelled publié pour bookingId=${booking.id}`);
}

module.exports = { publishBookingCreated, publishBookingCancelled };