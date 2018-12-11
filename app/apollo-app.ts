import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { SimpleStateContainer } from '../profunctor-optics/simple-state-container';
import { useProfunctor } from '../profunctor-optics/use-profunctor';
import { html, render } from 'lit-html';
import gql from 'graphql-tag';

import { WebSocketLink } from 'apollo-link-ws';
import { SubscriptionClient } from 'subscriptions-transport-ws';

const GRAPHQL_ENDPOINT = `ws://${location.hostname}:4000/graphql`;

const link = new WebSocketLink(
  new SubscriptionClient(GRAPHQL_ENDPOINT, {
    reconnect: true,
  }),
);

const client = new ApolloClient({
  link: link,
  connectToDevTools: true,
  cache: new InMemoryCache(),
});
const lsName = localStorage.getItem('myName');
const initialState: State = { messages: [], myName: lsName || 'anonymous' };
type State = { messages: Message[]; myName: string };
export type Message = { user: string; message: string };

const [{ getState, setState }, onStateChange] = useProfunctor(
  new SimpleStateContainer(initialState),
);

const onInput = async (e: KeyboardEvent) => {
  const message: string = e.target.value;
  if (e.keyCode === 13 && message.length) {
    await addMessage({ user: getState().myName, message });
    e.target.value = '';
    e.target.focus();
  }
  e.target.focus();
};
const setName = (e: Event) => {
  localStorage.setItem('myName', e.target.value);
  setState((state) => ({ ...state, myName: e.target.value }));
};

export const appTpl = (state: State) => html`
  <h1>Chat App</h1>
  <label>Your name: <input value=${state.myName} @change=${setName} /></label>
  <label>
  <ul>
    <li>${state.myName} says: <input @keyup=${onInput} /></li>
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
    .then((messages) =>
      setState((prev) => ({
        ...prev,
        messages: messages.data.messages.reverse(),
      })),
    );
};
getMessages();

// Todo subscribe to messageAdded
const createObserverMessages = () => {
  return client.subscribe<{ data: GQL.ISubscription }>({
    query: gql`
      subscription {
        messageAdded {
          user
          message
        }
      }
    `,
  });
};

createObserverMessages().subscribe((sub) => {
  const message = sub.data.messageAdded;
  setState((state) => {
    if (!message) return state;
    return { ...state, messages: [message, ...state.messages] };
  });
});

// Todo mutation addMessage
const addMessage = async (msg: Message) => {
  const message = await client.mutate<Message>({
    mutation: gql`
      mutation($user: String!, $message: String!) {
        addMessage(user: $user, message: $message) {
          user
          message
        }
      }
    `,
    variables: msg,
  });
  return message;
};

onStateChange(() => render(appTpl(getState()), document.body));
