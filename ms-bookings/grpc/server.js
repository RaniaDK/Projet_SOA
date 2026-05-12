const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const svc = require('../services/bookingService');

const PROTO_PATH = path.join(__dirname, '../../proto/bookings.proto');

function createServer() {
  const packageDef = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true, longs: String, enums: String, defaults: true, oneofs: true,
  });
  const proto = grpc.loadPackageDefinition(packageDef).bookings;
  const server = new grpc.Server();

  server.addService(proto.BookingService.service, {
    CheckAvailability: svc.checkAvailability,
    CreateBooking:     svc.createBooking,
    CancelBooking:     svc.cancelBooking,
    GetBooking:        svc.getBooking,
    ListUserBookings:  svc.listUserBookings,
    UpdateBooking:     svc.updateBooking,
    ListRooms:         svc.listRooms,
  });

  return server;
}

module.exports = { createServer };
