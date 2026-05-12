require('dotenv').config();
const grpc = require('@grpc/grpc-js');
const { createServer } = require('./grpc/server');
const { getDb } = require('./db/init');

const PORT = process.env.USERS_PORT || '50051';

async function main() {
  getDb();
  console.log('[ms-users] Base SQLite3 initialisée');

  const server = createServer();
  server.bindAsync(
    `0.0.0.0:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) { console.error(err); process.exit(1); }
      console.log(`[ms-users] Serveur gRPC démarré sur port ${port}`);
    }
  );
}

main().catch(console.error);
