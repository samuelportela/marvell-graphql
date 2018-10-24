import express from 'express';
import graphqlHTTP from 'express-graphql';
import fetch from 'node-fetch';
import Bundler from 'parcel-bundler';
import bodyParser from 'body-parser';

const app = express();
const API = 'https://gateway.marvel.com:443/v1/public/';
const key = '2f3e569af21ffe71193bd620a1b6792f';
const pkey = 'e4079be510019aa183b3a06ed4fefbda34833c58';
const getHash = () => {
  const ts = new Date().getMilliseconds();
  return `&ts=${ts}&hash=${md5(ts + pkey + key)}`;
};

const fetchResource = (res, queryParams = '') => {
  const url = `${API}${res}?apikey=${key}${getHash()}${queryParams}`;
  return fetch(url);
};

import { buildSchema, GraphQLString, isInputType } from 'graphql';
import md5 from 'md5';

// const schema = new GraphQLSchema({
//   query: new GraphQLObjectType({
//     name: 'RootQueryType',
//     fields: {
//       hello: {
//         type: GraphQLString,
//         resolve(parent) {
//           return 'world';
//         }
//       }
//     }
//   })
// });

const schema = buildSchema(`
  type Query {
    characters: [Character]
    character(id: Int): Character
  }

  type Character {
    id: ${GraphQLString}
    name: String
    description: String
    thumbnail: String
    favorite: Boolean
    comics(first: Int, offset: Int): [Comic]
  }
  
  type Comic {
    id: Int
    title: String
    description: String
    favorite: Boolean
  }




  type Mutation {
    updateCharacter(id: Int, input: CharacterInput): Character
    updateComic(id: Int, input: ComicInput): Comic

    setFavouriteCharacter(id: Int): Character
    setFavouriteComic(id: Int): Character
  }
  
  input CharacterInput {
    favorite: Boolean!
  }

  input ComicInput {
    favorite: Boolean!
  }
`);

const rootValue = {
  characters: async () => {
    const response = await fetchResource('characters');
    const data = await response.json();

    const favres = await fetch('http://localhost:4000/favourites');
    const favs: typeof favourites = await favres.json();

    return data.data.results.map((char) => {
      char.thumbnail = `${char.thumbnail.path}.${char.thumbnail.extension}`;
      char.favorite = !!favourites.characters.includes(char.id);
      return char;
    });
  },
  character: async (...args) => {
    const { id } = args[0];
    console.log(args);
    const response = await fetchResource('characters/' + id);
    const data = await response.json();
    const result = data.data.results[0];

    const favres = await fetch('http://localhost:4000/favourites');
    const favs: typeof favourites = await favres.json();

    return {
      ...result,
      thumbnail: `${result.thumbnail.path}.${result.thumbnail.extension}`,
      favorite: () => {
        return favs.characters.includes(id);
      },
      comics: async ({ first = 10, offset = 0 }) => {
        const response = await fetchResource(
          'characters/' + id + '/comics',
          `&limit=${first}&offset=${offset}`,
        );
        const data = await response.json();

        return data.data.results.map((comic) => {
          comic.favorite = favs.comics.includes(comic.id);
          return comic;
        });
      },
    };
  },
  updateCharacter: async ({ id, input: { favorite } }) => {
    const resp: typeof favourites = await fetch(
      'http://localhost:4000/favourites',
      {
        method: 'POST',
        body: JSON.stringify({ type: 'characters', id, favorite }),
        headers: {
          'Content-Type': 'application/json',
        },
      },
    ).then((resp) => resp.json());

    return rootValue.character({ id });
  },
};

app.use((req, res, next) => {
  console.log('---');
  next();
});
app.use(bodyParser.json());

const favourites = {
  characters: [1009148],
  comics: [66777],
};

app.post('/favourites', (req, res) => {
  console.log('post favourites');
  const favs = req.body;
  if (!favourites[favs.type].includes(favs.id) && favs.favorite) {
    favourites[favs.type].push(favs.id);
  }
  if (favourites[favs.type].includes(favs.id) && !favs.favorite) {
    favourites[favs.type] = favourites[favs.type].filter((x) => x !== favs.id);
  }
  res.send(favourites);
});

app.get('/favourites', (_, res) => {
  console.log('get favourites');
  res.send(favourites);
});

app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    rootValue,
    graphiql: true,
  }),
);

const bundler: any = new Bundler('./app/index.html');
app.use(bundler.middleware());

app.listen(4000, () => {
  console.log('server started at port: 4000');
});
