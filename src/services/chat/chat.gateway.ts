import { HttpStatus, UseFilters } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AllExceptionsFilter } from '../../common/filters/all-exceptions.filter';
import { Logger } from '../../logger/logger.service';
import { ChatService } from './chat.service';
import { ChatEvent } from './constants/chat-events.constant';
import { LeftConversationDTO } from './dto/left-conversation.dto';
import { GetMessagesDTO } from './dto/get-messages.dto';
import { SendMessageDTO } from './dto/send-message.dto';
import { UserEvent } from './constants/user-events.constant';
import { UpdateUserConnectionStatusDTO } from './dto/update-user-connection-status.dto';
import { GetUserStatusByUserIdDTO } from './dto/get-user-status-by-user-id.dto';
import { wsResponse } from '../../shared/utils/ws-response.utils';
import { GetConversationStatusDTO } from './dto/get-converstaion-status.dto';

@UseFilters(AllExceptionsFilter)
@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() private readonly server: Server;

  constructor(
    private readonly logger: Logger,
    private readonly chatService: ChatService
  ) {}

  async handleConnection(client: Socket) {
    const { user } = await this.chatService.addUserConnectionInCache({
      client
    });
    this.logger.log(`user:connected: ${user.username}`);
  }

  async handleDisconnect(client: Socket) {
    const { user } = await this.chatService.deleteUserConnectionInCache({
      client
    });
    this.logger.log(`user:disconnected: ${user.username}`);

    const userConnections = (await this.chatService.getUserConnections()) || {};
    for (const { userId, connectionStatus } of Object.values(userConnections)) {
      this.server.emit(UserEvent.GetUserStatusByUserId, { userId, connectionStatus });
    }
  }

  @SubscribeMessage(ChatEvent.MatchingStranger)
  async handleChatMatchingStranger(@ConnectedSocket() client: Socket) {
    const toMatchingStrangerResult = await this.chatService.toMatchingStranger({
      client
    });
    if (toMatchingStrangerResult.status === 'matched') {
      const userConnections = (await this.chatService.getUserConnections()) || {};
      for (const record of toMatchingStrangerResult.participants!) {
        const { userId } = record;
        this.server
          .to(userConnections[userId].clientId)
          .emit(ChatEvent.MatchedStranger, toMatchingStrangerResult);
      }
    } else {
      return wsResponse({ data: toMatchingStrangerResult });
    }
  }

  @SubscribeMessage(ChatEvent.SkipStranger)
  async handleSkipStranger(@MessageBody() message: LeftConversationDTO) {
    const userConnections = (await this.chatService.getUserConnections()) || {};

    const leftConversationResult = await this.chatService.leftConversation(message);
    for (const record of leftConversationResult) {
      const { userId } = record;
      this.server.to(userConnections[userId].clientId).emit(ChatEvent.SkipStranger, record);
    }
    console.log(
      '[LOG] - chat.gateway.ts:76 - ChatGateway - handleSkipStranger - leftConversationResult:',
      leftConversationResult
    );
  }

  @SubscribeMessage(ChatEvent.GetMessages)
  async handleGetMessages(@MessageBody() message: GetMessagesDTO) {
    if (!message.requesterId) {
      return wsResponse({
        error: {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Requester ID is missing.'
        }
      });
    }

    const isConversationExists = await this.chatService.isConversationExists({
      userId: message.requesterId,
      converstaionId: message.conversationId
    });

    if (!isConversationExists) {
      return wsResponse({
        error: {
          statusCode: HttpStatus.FORBIDDEN,
          message: 'Conversation does not exist or you do not have access.'
        }
      });
    }

    const messages = await this.chatService.getMessages({ conversationId: message.conversationId });
    return wsResponse({ data: messages });
  }

  @SubscribeMessage(ChatEvent.SendMessage)
  async handleSendMessage(@MessageBody() message: SendMessageDTO) {
    const userConnections = (await this.chatService.getUserConnections()) || {};

    const messageSended = await this.chatService.sendMessage(message);
    const { participants = [] } =
      (await this.chatService.findActiveStrangerConversationByUserId({
        userId: messageSended.senderId!
      })) || {};

    const newMessagePayload: GetMessagesDTO = {
      conversationId: messageSended.conversationId!,
      messageId: messageSended.id
    };

    const newMessages = await this.chatService.getMessages(newMessagePayload);

    for (const participant of participants) {
      const clientId = userConnections[participant.userId]?.clientId;
      if (clientId) {
        this.server.to(clientId).emit(ChatEvent.GetMessages, newMessages);
      }
    }
  }

  @SubscribeMessage(ChatEvent.GetConversationStatus)
  async handleGetConverstaionStatus(@MessageBody() message: GetConversationStatusDTO) {
    // this.chatService.
  }

  @SubscribeMessage(UserEvent.GetUserStatusByUserId)
  async handleGetUserStatusByUserId(@MessageBody() message: GetUserStatusByUserIdDTO) {
    const userConnections = (await this.chatService.getUserConnections()) || {};
    return wsResponse({ data: userConnections?.[message.userId] });
  }

  @SubscribeMessage(UserEvent.UpdateUserConnectionStatus)
  async handleUpdateUserConnectionStatus(@MessageBody() message: UpdateUserConnectionStatusDTO) {
    const updatedStatus = await this.chatService.updateUserConnectionStatus(message);
    const userConnections = (await this.chatService.getUserConnections()) || {};
    for (const { userId, connectionStatus } of Object.values(userConnections)) {
      this.server.emit(UserEvent.GetUserStatusByUserId, { userId, connectionStatus });
    }
    return wsResponse({ data: updatedStatus });
  }
}
