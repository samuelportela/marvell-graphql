import { ApolloServer, gql } from 'apollo-server-express';
const { PubSub } = require('apollo-server');

const pubsub = new PubSub();

// This is a (sample) collection of books we'll be able to query
// the GraphQL server for.  A more complete example might fetch
// from an existing data source like a REST API or database.
const books = [
  {
    title: 'Harry Potter and the Chamber of Secrets',
    author: 'J.K. Rowling',
  },
  {
    title: 'Jurassic Park',
    author: 'Michael Crichton',
  },
];

const messages = [
  {
    user: 'albert',
    message: 'This is the first message',
  },
  {
    user: 'jeroen',
    message: 'Great chat app!',
  },
];

// Type definitions define the "shape" of your data and specify
// which ways the data can be fetched from the GraphQL server.
const typeDefs = gql`
  type Subscription {
    messageAdded: Message
  }

  type Message {
    user: String
    message: String
  }

  type Book {
    title: String
    author: String
  }

  # The "Query" type is the root of all GraphQL queries.
  # (A "Mutation" type will be covered later on.)
  type Query {
    books: [Book]
  }
`;

const MESSAGE_ADDED = 'POST_ADDED';

// Resolvers define the technique for fetching the types in the
// schema.  We'll retrieve books from the "books" array above.
const resolvers = {
  Query: {
    books: () => books,
  },
  Subscription: {
    postAdded: {
      // Additional event labels can be passed to asyncIterator creation
      subscribe: () => pubsub.asyncIterator([MESSAGE_ADDED]),
    },
  },
  Mutation: {
    addPost(root: any, args: any, context: any) {
      pubsub.publish(MESSAGE_ADDED, { messageAdded: args });
      messages.push(args);
      return true;
    },
  },
};

// In the most basic sense, the ApolloServer can be started
// by passing type definitions (typeDefs) and the resolvers
// responsible for fetching the data for those types.
export const apolloServer = new ApolloServer({ typeDefs, resolvers });
