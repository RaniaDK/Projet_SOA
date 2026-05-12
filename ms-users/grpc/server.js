const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const svc = require('../services/userService');

const PROTO_PATH = path.join(__dirname, '../../proto/users.proto');

function createServer() {
  const packageDef = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });
  const proto = grpc.loadPackageDefinition(packageDef).users;
  const server = new grpc.Server();

  server.addService(proto.UserService.service, {
    RegisterUser:   svc.registerUser,
    LoginUser:      svc.loginUser,
    GetUserProfile: svc.getUserProfile,
    UpdateProfile:  svc.updateProfile,
    ValidateToken:  svc.validateToken,
  });

  return server;
}

module.exports = { createServer };
