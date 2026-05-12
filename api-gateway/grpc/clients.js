const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const opts = { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true };

const userProto = grpc.loadPackageDefinition(
  protoLoader.loadSync(path.join(__dirname, '../../proto/users.proto'), opts)
).users;

const bookingProto = grpc.loadPackageDefinition(
  protoLoader.loadSync(path.join(__dirname, '../../proto/bookings.proto'), opts)
).bookings;

const notifProto = grpc.loadPackageDefinition(
  protoLoader.loadSync(path.join(__dirname, '../../proto/notifications.proto'), opts)
).notifications;

const USERS_ADDR    = process.env.USERS_ADDR    || 'localhost:50051';
const BOOKINGS_ADDR = process.env.BOOKINGS_ADDR || 'localhost:50052';
const NOTIFS_ADDR   = process.env.NOTIFS_ADDR   || 'localhost:50053';

const userClient    = new userProto.UserService(USERS_ADDR,    grpc.credentials.createInsecure());
const bookingClient = new bookingProto.BookingService(BOOKINGS_ADDR, grpc.credentials.createInsecure());
const notifClient   = new notifProto.NotifService(NOTIFS_ADDR,   grpc.credentials.createInsecure());

function grpcCall(client, method, payload) {
  return new Promise((resolve, reject) => {
    client[method](payload, (err, response) => {
      if (err) return reject(err);
      resolve(response);
    });
  });
}

module.exports = { userClient, bookingClient, notifClient, grpcCall };