require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');

const { typeDefs } = require('./graphql/schema');
const { resolvers } = require('./graphql/resolvers');
const { userClient, grpcCall } = require('./grpc/clients');

const authRoutes    = require('./rest/routes/auth');
const roomRoutes    = require('./rest/routes/rooms');
const bookingRoutes = require('./rest/routes/bookings');
const notifRoutes   = require('./rest/routes/notifications');

const PORT = process.env.GATEWAY_PORT || 4000;

async function main() {
  const app = express();
  app.use(cors());
  app.use(bodyParser.json());

  app.use('/auth',          authRoutes);
  app.use('/rooms',         roomRoutes);
  app.use('/bookings',      bookingRoutes);
  app.use('/notifications', notifRoutes);

  app.get('/health', (_, res) => res.json({ status: 'ok', service: 'api-gateway' }));

  const apollo = new ApolloServer({ typeDefs, resolvers });
  await apollo.start();

  app.use('/graphql', expressMiddleware(apollo, {
    context: async ({ req }) => {
      const authHeader = req.headers['authorization'];
      if (!authHeader || !authHeader.startsWith('Bearer ')) return { userId: null };
      const token = authHeader.split(' ')[1];
      try {
        const result = await grpcCall(userClient, 'ValidateToken', { token });
        return result.valid ? { userId: result.user_id, email: result.email } : { userId: null };
      } catch {
        return { userId: null };
      }
    },
  }));

  app.listen(PORT, () => {
    console.log(`[api-gateway] Démarré sur http://localhost:${PORT}`);
    console.log(`[api-gateway] GraphQL  → http://localhost:${PORT}/graphql`);
    console.log(`[api-gateway] REST     → http://localhost:${PORT}/auth, /rooms, /bookings, /notifications`);
  });
}

main().catch(console.error);
