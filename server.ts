import express from 'express';
import Bundler from 'parcel-bundler';
import { execute, subscribe } from 'graphql';
import { apolloServer, schema } from './server/apollo-server';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { createServer } from 'http';

const app = express();

// setup GraphQL
apolloServer.applyMiddleware({ app, path: '/graphql' });

// setup client app
const bundler: any = new Bundler('./app/index.html');
app.use(bundler.middleware());

const server = createServer(app);

server.listen({ port: 4000 }, () => {
  new SubscriptionServer(
    {
      execute,
      subscribe,
      schema,
    },
    {
      server: server,
      path: '/graphql',
    },
  );
  console.log(
    `🚀 Server ready at http://localhost:4000${apolloServer.graphqlPath}`,
  );
});
