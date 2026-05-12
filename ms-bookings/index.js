require('dotenv').config();
const grpc = require('@grpc/grpc-js');
const { createServer } = require('./grpc/server');
const { getDb } = require('./db/init');

const PORT = process.env.BOOKINGS_PORT || '50052';

async function main() {
  getDb();
  console.log('[ms-bookings] Base SQLite3 initialisée');

  const server = createServer();
  server.bindAsync(
    `0.0.0.0:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) { console.error(err); process.exit(1); }
      console.log(`[ms-bookings] Serveur gRPC démarré sur port ${port}`);
    }
  );
}

main().catch(console.error);