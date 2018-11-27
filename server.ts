import express from 'express';
import graphqlHTTP from 'express-graphql';
import fetch from 'fetch-with-proxy';
import bodyParser from 'body-parser';
import { buildSchema } from 'graphql';
import md5 from 'md5';

import { post, get } from './favorites';
import { appMiddleware } from './app';

const app = express();
const API = 'https://gateway.marvel.com:443/v1/public/';
const key = 'fill in the key'; // https://developer.marvel.com/
const pkey = 'fill in the private key';

const getHash = () => {
  const ts = new Date().getMilliseconds();
  return `&ts=${ts}&hash=${md5(ts + pkey + key)}`;
};

const fetchResource = (res, queryParams = '') => {
  const url = `${API}${res}?apikey=${key}${getHash()}${queryParams}`;
  return fetch(url);
};


// ToDo Create schema
const schema = buildSchema(`

`);

// ToDo create implementation
const rootValue = {

};

// separator per request for logging
app.use((req, res, next) => {
  console.log('---');
  next();
});
app.use(bodyParser.json());


// /favorites endpoints
app.post('/favourites', post);
app.get('/favourites', get);

app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    rootValue,
    graphiql: true,
  }),
);

// build and host ./app
app.use(appMiddleware);

app.listen(4000, () => {
  console.log('server started at port: 4000');
});
