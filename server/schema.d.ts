// tslint:disable
// graphql typescript definitions

declare namespace GQL {
  interface IGraphQLResponseRoot {
    data?: IQuery | IMutation | ISubscription;
    errors?: Array<IGraphQLResponseError>;
  }

  interface IGraphQLResponseError {
    /** Required for all errors */
    message: string;
    locations?: Array<IGraphQLResponseErrorLocation>;
    /** 7.2.2 says 'GraphQL servers may provide additional entries to error' */
    [propName: string]: any;
  }

  interface IGraphQLResponseErrorLocation {
    line: number;
    column: number;
  }

  interface IQuery {
    __typename: 'Query';
    messages: Array<IMessage | null> | null;
  }

  interface IMessage {
    __typename: 'Message';
    user: string | null;
    message: string | null;
  }

  interface IMutation {
    __typename: 'Mutation';
    addMessage: IMessage | null;
  }

  interface IAddMessageOnMutationArguments {
    user?: string | null;
    message?: string | null;
  }

  interface ISubscription {
    __typename: 'Subscription';
    messageAdded: IMessage | null;
  }
}

// tslint:enable
