import { generateClient } from "aws-amplify/api";

type AmplifyGraphQLClient = {
  graphql: (args: any) => Promise<any>;
};

let _client: AmplifyGraphQLClient | null = null;

export function getClient(): AmplifyGraphQLClient {
  if (!_client) {
    _client = generateClient() as unknown as AmplifyGraphQLClient;
  }
  return _client;
}