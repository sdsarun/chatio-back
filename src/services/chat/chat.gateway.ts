import { UseFilters } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AllExceptionsFilter } from '../../common/filters/all-exceptions.filter';
import { Logger } from '../../logger/logger.service';
import { ChatService } from './chat.service';
import { ChatEvent } from './constants/chat-events.constant';
import { LeftConversationDTO } from './dto/left-conversation.dto';
import { GetMessagesDTO } from './dto/get-messages.dto';
import { SendMessageDTO } from './dto/send-message.dto';

@UseFilters(AllExceptionsFilter)
@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() private readonly server: Server;

  constructor(
    private readonly logger: Logger,
    private readonly chatService: ChatService,
  ) { }

  async handleConnection(client: Socket) {
    const { user } = await this.chatService.addUserConnectionInCache({ client });
    this.logger.log(`user:connected: ${user.username}`);
  }

  async handleDisconnect(client: Socket) {
    const { user } = await this.chatService.deleteUserConnectionInCache({ client });
    this.logger.log(`user:disconnected: ${user.username}`);
  }

  @SubscribeMessage(ChatEvent.MatchingStranger)
  async handleChatMatchingStranger(
    @ConnectedSocket() client: Socket,
  ) {
    const toMatchingStrangerResult = await this.chatService.toMatchingStranger({ client });
    if (toMatchingStrangerResult.status === "matched") {
      const userConnections = await this.chatService.getUserConnections() || {};
      for (const record of toMatchingStrangerResult.participants!) {
        const { userId } = record;

        this.server
          .to(userConnections[userId].clientId)
          .emit(ChatEvent.MatchedStranger, toMatchingStrangerResult);
      }
    } else {
      return toMatchingStrangerResult;
    }
  }

  @SubscribeMessage(ChatEvent.SkipStranger)
  async handleSkipStranger(
    @MessageBody() message: LeftConversationDTO,
  ) {
    const userConnections = await this.chatService.getUserConnections() || {};

    const leftConversationResult = await this.chatService.leftConversation(message);
    for (const record of leftConversationResult) {
      const { userId } = record;

      this.server
        .to(userConnections[userId].clientId)
        .emit(ChatEvent.SkipStranger, record);
    }
  }

  @SubscribeMessage(ChatEvent.GetMessages)
  handleGetMessages(
    @MessageBody() message: GetMessagesDTO,
  ) {
    return this.chatService.getMessages(message);
  }

  @SubscribeMessage(ChatEvent.SendMessage)
  async handleSendMessage(
    @MessageBody() message: SendMessageDTO,
  ) {
    const userConnections = await this.chatService.getUserConnections() || {};

    const messageSended = await this.chatService.sendMessage(message);
    const { participants = [] } = await this.chatService.findActiveStrangerConversationByUserId({ userId: messageSended.senderId! }) || {};

    const newMessagePayload: GetMessagesDTO = {
      conversationId: messageSended.conversationId!,
      messageId: messageSended.id,
    }

    const newMessages = await this.chatService.getMessages(newMessagePayload);

    for (const participant of participants) {
      if (participant.userId !== messageSended.senderId) {
        const clientId = userConnections[participant.userId]?.clientId;
        if (clientId) {
          this.server
            .to(clientId)
            .emit(ChatEvent.GetMessages, newMessages);
        }
      }
    }
  }
}