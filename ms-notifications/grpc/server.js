const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const svc = require('../services/notifService');

const PROTO_PATH = path.join(__dirname, '../../proto/notifications.proto');

function createServer() {
  const packageDef = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true, longs: String, enums: String, defaults: true, oneofs: true,
  });
  const proto = grpc.loadPackageDefinition(packageDef).notifications;
  const server = new grpc.Server();

  server.addService(proto.NotifService.service, {
    SendNotification: svc.sendNotification,
    GetUserNotifs:    svc.getUserNotifs,
    MarkAsRead:       svc.markAsRead,
  });

  return server;
}

module.exports = { createServer };
