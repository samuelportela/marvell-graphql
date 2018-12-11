import { PubSub, ApolloServer, gql } from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import { Message } from '../app/apollo-app';

const pubsub = new PubSub();

const messages = [
  {
    user: 'Albert',
    message: 'This is the first message',
  },
  {
    user: 'Jeroen',
    message: 'Great chat app!',
  },
];

// Type definitions define the "shape" of your data and specify
// which ways the data can be fetched from the GraphQL server.
export const typeDefs = gql`
  type Subscription {
    messageAdded: Message
  }

  type Message {
    user: String
    message: String
  }

  type Mutation {
    addMessage(user: String, message: String): Message
  }

  type Query {
    messages: [Message]
  }
`;

const MESSAGE_ADDED = 'POST_ADDED';

// Resolvers define the technique for fetching the types in the
// schema.  We'll retrieve books from the "books" array above.
const resolvers = {
  Query: {
    messages: () => messages,
  },
  Subscription: {
    // https://github.com/apollographql/graphql-subscriptions
    // Todo implement messageAdded
    messageAdded: {
      // Additional event labels can be passed to asyncIterator creation
      subscribe: () => pubsub.asyncIterator([MESSAGE_ADDED]),
    },
  },
  Mutation: {
    // Todo implement addMessage
    addMessage(root: any, msg: Message, context: any) {
      pubsub.publish(MESSAGE_ADDED, { messageAdded: msg });
      messages.push(msg);
      return msg;
    },
  },
};

export const schema = makeExecutableSchema({ typeDefs, resolvers });

// In the most basic sense, the ApolloServer can be started
// by passing type definitions (typeDefs) and the resolvers
// responsible for fetching the data for those types.
export const apolloServer = new ApolloServer({ schema });
