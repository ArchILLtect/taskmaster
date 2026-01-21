import { generateClient } from "aws-amplify/api";

let _client: ReturnType<typeof generateClient> | null = null;

export function getClient() {
  if (!_client) _client = generateClient();
  return _client;
}