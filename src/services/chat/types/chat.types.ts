import { UserConnectionStatus } from '../constants/user-connection-status.constant';

export type StrangerQueue = Record<
  string,
  {
    userId: string;
  }
>;

export type UserConnections = Record<
  string,
  {
    clientId: string;
    userId: string;
    username: string;
    connectionStatus: UserConnectionStatus;
    lastOnlineStatusAt: Date;
  }
>;

export type UserConnection = UserConnections[string];
