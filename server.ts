import express from 'express';
import Bundler from 'parcel-bundler';
import { apolloServer } from './server/apollo-server';

const app = express();

// create 
apolloServer.applyMiddleware({ app, path: '/graphql' });

const bundler: any = new Bundler('./app/index.html');
app.use(bundler.middleware());

app.listen({ port: 4000 }, () =>
  console.log(
    `🚀 Server ready at http://localhost:4000${apolloServer.graphqlPath}`,
  ),
);
