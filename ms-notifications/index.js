require('dotenv').config();
const grpc = require('@grpc/grpc-js');
const { createServer } = require('./grpc/server');
const { getDb } = require('./db/init');
const { startConsumer } = require('./kafka/consumer');

const PORT = process.env.NOTIFS_PORT || '50053';

async function main() {
  await getDb();

  const server = createServer();
  server.bindAsync(
    `0.0.0.0:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) { console.error(err); process.exit(1); }
      console.log(`[ms-notifications] Serveur gRPC démarré sur port ${port}`);
    }
  );

  await startConsumer();
}

main().catch(console.error);
