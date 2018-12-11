import ApolloClient from 'apollo-boost';
import { SimpleStateContainer } from '../profunctor-optics/simple-state-container';
import { useProfunctor } from '../profunctor-optics/use-profunctor';
import { html, render } from 'lit-html';
import gql from 'graphql-tag';

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
});

const initialState = { messages: [] };
type State = { messages: Message[] };
export type Message = { user: string; message: string };

const [{ getState, setState }, onStateChange] = useProfunctor(
  new SimpleStateContainer(initialState),
);

export const appTpl = (state: State) => html`
  <h1>Chat App</h1>
  <ul>
    ${state.messages.map(
      ({ user, message }) => html`<li>${user}: ${message}</li>`,
    )}
  </ul>
`;

const getMessages = () => {
  client
    .query<{ messages: Message[] }>({
      query: gql`
        query GetMessages {
          messages {
            user
            message
          }
        }
      `,
    })
    .then((messages) => setState((prev) => messages.data));
};
getMessages();

// Todo subscribe to messageAdded
const subscribeToMessages = () => {
  return client.subscribe<Message>({
    query: gql`
      subscription someName {
        messageAdded {
          user
          message
        }
      }
    `,
  });
};

subscribeToMessages().subscribe((newMessage) => {
  setState((state) => {
    console.log(newMessage);
    if (!newMessage) state;
    return { ...state, messages: [...state.messages, newMessage] };
  });
});

// Todo mutation addMessage
const addMessage = (message: Message) => {
  client.query({
    query: gql`

  `,
  });
};

onStateChange(() => render(appTpl(getState()), document.body));
