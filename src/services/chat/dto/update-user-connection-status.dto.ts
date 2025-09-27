import { UserConnectionStatus } from '../constants/user-connection-status.constant';

export class UpdateUserConnectionStatusDTO {
  userId: string;
  connectionStatus: UserConnectionStatus;
}
