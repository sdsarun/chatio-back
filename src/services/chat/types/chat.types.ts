export type StrangerQueue = Record<string, {
  userId: string;
}>;

export type UserConnections = Record<string, {
  clientId: string;
  userId: string;
  username: string;
}>;