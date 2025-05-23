import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { WsException } from "@nestjs/websockets";
import { Op, WhereOptions } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import { Socket } from "socket.io";
import { ConversationParticipant } from "../../database/models/conversation-participant.model";
import { Conversation } from "../../database/models/conversation.model";
import { MasterConversationType } from "../../database/models/master-conversation-type.model";
import { Logger } from "../../logger/logger.service";
import { TransactionalServiceActionOptions } from "../../shared/types/service-action";
import { validateDTO } from "../../shared/utils/validation/dto.validation";
import { CacheManagerService } from "../cache-manager/cache-manager.service";
import { User } from "../graphql/models/user.model";
import { ConversationType } from "../master/master.constants";
import { MasterService } from "../master/master.service";
import { UserService } from "../user/user.service";
import { AddUserConnectionDTO } from "./dto/add-user-connection-in-cache.dto";
import { DeleteUserConnectionInCacheDTO } from "./dto/delete-user-connection-in-cache.dto";
import { FindAllConversationByUserIdDTO } from "./dto/find-all-conversation-by-user-id.dto";
import { LeftConversationDTO } from "./dto/left-conversation.dto";
import { ToMatchingStrangerDTO } from "./dto/to-matching-stranger.dto";
import { StrangerQueue, UserConnections } from "./types/chat.types";
import { isBoolean } from "class-validator";
import { AddUserMatchingInCacheDTO } from "./dto/add-user-matching-in-cache.dto";
import { DeleteUserMatchingInCacheDTO } from "./dto/delete-user.matching-in-cache.dto";
import {
  User as UserModel,
} from '../../database/models/user.model';
import { JoinConversationDTO } from "./dto/join-conversation.dto";
import { CreateConversationDTO } from "./dto/create-conversation.dto";
import { FindActiveStrangerConversationByUserIdDTO } from "./dto/find-active-stranger-conversation-by-user-id.dto";
import { ChatCacheKey } from "./constants/chat-cache-key.constant";
import { Message } from "../../database/models/message.model";
import { GetMessagesDTO } from "./dto/get-messages.dto";
import { SendMessageDTO } from "./dto/send-message.dto";
import { MessageRead } from "../../database/models/message-read.model";

@Injectable()
export class ChatService {

  constructor(
    @InjectModel(Conversation) private readonly conversation: typeof Conversation,
    @InjectModel(ConversationParticipant) private readonly conversationParticipant: typeof ConversationParticipant,
    @InjectModel(MasterConversationType) private readonly conversationType: typeof MasterConversationType,
    @InjectModel(UserModel) private readonly user: typeof UserModel,
    @InjectModel(Message) private readonly message: typeof Message,
    @InjectModel(MessageRead) private readonly messageRead: typeof MessageRead,

    private readonly logger: Logger,
    private readonly userService: UserService,
    private readonly cache: CacheManagerService,
    private readonly masterService: MasterService,
    private readonly sqz: Sequelize,
  ) { }

  extractUserFromClient(client: Socket): User {
    return (client as any)?.user as User;
  }

  async toMatchingStranger(
    payload: ToMatchingStrangerDTO,
    options?: Pick<TransactionalServiceActionOptions, "transaction">,
  ): Promise<{
    status: "matching" | "matched" | "in_conversation";
    conversation?: Conversation;
    participants?: ConversationParticipant[];
  }> {
    this.logger.setContext(this.toMatchingStranger.name);

    const { client } = payload;

    const user = this.extractUserFromClient(client);

    const strangerConversation = await this.findActiveStrangerConversationByUserId({ userId: user.id }, options);
    if (strangerConversation) {
      await Promise.all(strangerConversation.participants.map((record) => this.leftConversation(record, options)));
    }

    const strangerQueue = await this.cache.manager.get<StrangerQueue>(ChatCacheKey.MatchingStrangerQueue);
    if (strangerQueue && Object.keys(strangerQueue).length > 0 && !strangerQueue?.[user.id]) {
      const stranger = Object.values(strangerQueue)[0];

      const { conversation, participants } = await this.sqz.transaction({ transaction: options?.transaction }, async (transaction) => {
        const createdConversation = await this.createConversation({ conversationTypeName: ConversationType.STRANGER_MESSAGE }, { transaction });
        const createdParticipants = await this.joinConversation([
          { conversationId: createdConversation.id, userId: user.id },
          { conversationId: createdConversation.id, userId: stranger.userId },
        ], { transaction });

        return {
          conversation: createdConversation,
          participants: createdParticipants,
        };
      });

      await Promise.all(participants.map((record) => this.deleteUserMatchingInCache(record)));
      return { status: "matched", conversation, participants }
    } else {
      await this.addUserMatchingInCache({ userId: user.id });
      return { status: "matching" };
    }
  }

  async createConversation(
    payload: CreateConversationDTO,
    options?: TransactionalServiceActionOptions,
  ): Promise<Conversation> {
    if (options?.validateDTO) {
      await validateDTO(payload, CreateConversationDTO);
    }
    const { conversationTypeName } = payload;
    const selectedConversationType = await this.masterService.findConservationTypeByName({ name: conversationTypeName });
    if (!selectedConversationType) {
      throw new WsException("Conversation type is missing.")
    }
    return this.conversation.create({ conversationTypeId: selectedConversationType.id }, {
      raw: true,
      transaction: options?.transaction,
    });
  }

  async joinConversation(
    payload: JoinConversationDTO[],
    options?: TransactionalServiceActionOptions,
  ): Promise<ConversationParticipant[]> {
    if (options?.validateDTO) {
      await Promise.all(payload.map((payloadItem) => validateDTO(payloadItem, JoinConversationDTO)))
    }
    return this.conversationParticipant.bulkCreate(payload, { transaction: options?.transaction });
  }

  async leftConversation(
    payload: LeftConversationDTO,
    options?: TransactionalServiceActionOptions,
  ): Promise<ConversationParticipant[]> {
    if (options?.validateDTO) {
      await validateDTO(payload, LeftConversationDTO, options);
    }

    const [, updated] = await this.conversationParticipant.update({ leftAt: new Date() }, {
      where: {
        conversationId: payload.conversationId,
        ...(payload?.userId && {
          userId: payload?.userId
        })
      },
      transaction: options?.transaction,
      returning: true,
    });

    return updated;
  }

  async getUserConnections(): Promise<UserConnections | null> {
    return this.cache.manager.get<UserConnections>(ChatCacheKey.UserConnections);
  }

  async addUserConnectionInCache(payload: AddUserConnectionDTO): Promise<{ user: User }> {
    const { client } = payload;
    const user = this.extractUserFromClient(client);
    const userConnections = await this.getUserConnections() || {};
    userConnections[user.id] = {
      clientId: client.id,
      userId: user.id,
      username: user.username
    };
    this.cache.manager.set<UserConnections>(ChatCacheKey.UserConnections, userConnections);
    return { user };
  }

  async deleteUserConnectionInCache(payload: DeleteUserConnectionInCacheDTO): Promise<{ user: User }> {
    const { client } = payload;
    const user = this.extractUserFromClient(client);
    const userConnections = await this.getUserConnections() || {};
    delete userConnections[user.id];
    this.cache.manager.set<UserConnections>(ChatCacheKey.UserConnections, userConnections);
    await this.deleteUserMatchingInCache({ userId: user.id });
    return { user }
  }

  async addUserMatchingInCache(payload: AddUserMatchingInCacheDTO): Promise<void> {
    const { userId } = payload;
    const strangerQueue = await this.cache.manager.get<StrangerQueue>(ChatCacheKey.MatchingStrangerQueue) || {};
    if (!strangerQueue?.[userId]) {
      strangerQueue[userId] = { userId }
      await this.cache.manager.set<StrangerQueue>(ChatCacheKey.MatchingStrangerQueue, strangerQueue);
    }
  }

  async deleteUserMatchingInCache(payload: DeleteUserMatchingInCacheDTO): Promise<void> {
    const { userId } = payload;
    const strangerQueue = await this.cache.manager.get<StrangerQueue>(ChatCacheKey.MatchingStrangerQueue) || {};
    if (strangerQueue?.[userId]) {
      delete strangerQueue[userId];
      await this.cache.manager.set<StrangerQueue>(ChatCacheKey.MatchingStrangerQueue, strangerQueue);
    }
  }

  async findAllConversationByUserId(
    payload: FindAllConversationByUserIdDTO,
    options?: TransactionalServiceActionOptions,
  ): Promise<ConversationParticipant[]> {
    if (options?.validateDTO) {
      await validateDTO(payload, FindAllConversationByUserIdDTO);
    }
    const { userId, conversationTypeName = "", isLeft } = payload;

    const whereConversationParticipant: WhereOptions<ConversationParticipant> = { userId };
    const whereConversationType: WhereOptions<MasterConversationType> = {};

    if (isBoolean(isLeft)) {
      whereConversationParticipant.leftAt = { [isLeft ? Op.not : Op.is]: null };
    }

    if (conversationTypeName) {
      whereConversationType.name = conversationTypeName;
    }

    return this.conversationParticipant.findAll({
      where: whereConversationParticipant,
      include: [
        {
          model: this.conversation,
          required: true,
          include: [
            {
              model: this.conversationType,
              required: true,
              where: whereConversationType,
            }
          ],
        }
      ],
      nest: true,
      raw: true,
      transaction: options?.transaction,
    });
  }

  async findActiveStrangerConversationByUserId(
    payload: FindActiveStrangerConversationByUserIdDTO,
    options?: TransactionalServiceActionOptions,
  ): Promise<{ conversation: Conversation; participants: ConversationParticipant[] } | null> {
    if (options?.validateDTO) {
      await validateDTO(payload, FindActiveStrangerConversationByUserIdDTO)
    }

    const { userId } = payload;

    const activeConversation = await this.conversationParticipant.findOne({
      where: {
        userId,
        leftAt: { [Op.is]: null },
      },
      include: [
        {
          model: this.conversation,
          required: true,
          include: [
            {
              model: this.conversationType,
              required: true,
              where: {
                name: ConversationType.STRANGER_MESSAGE
              },
            }
          ],
        }
      ],
      raw: true,
      nest: true,
      transaction: options?.transaction,
    });

    if (!activeConversation) {
      return null;
    }

    const [
      conversation,
      participants,
    ] = await Promise.all([
      this.conversation.findOne({
        where: { id: activeConversation.id },
        include: { all: true, nested: true },
        raw: true,
        nest: true,
        transaction: options?.transaction,
      }),
      this.conversationParticipant.findAll({
        where: {
          conversationId: activeConversation?.conversationId,
        },
        include: { all: true, nested: true },
        raw: true,
        nest: true,
        transaction: options?.transaction,
      }),
    ]);

    return {
      conversation: conversation!,
      participants
    }
  }

  async getMessages(
    payload: GetMessagesDTO,
    options?: TransactionalServiceActionOptions,
  ): Promise<Message[]> {
    if (options?.validateDTO) {
      await validateDTO(payload, GetMessagesDTO)
    }

    const { 
      messageId,
      requesterId, 
      conversationId, 
      offset,
      limit,
    } = payload;

    const whereMessage: WhereOptions<Message> = {
      conversationId,
    }

    if (messageId) {
      whereMessage.id = messageId;
    }

    if (requesterId) {
      whereMessage.senderId = requesterId;
    }

    return this.message.findAll({
      where: whereMessage,
      include: {
        all: true,
        nested: true,
      },
      nest: true,
      transaction: options?.transaction,
      order: [["sent_at", "DESC"]],
      offset,
      limit,
    });
  }

  async sendMessage(
    payload: SendMessageDTO,
    options?: TransactionalServiceActionOptions,
  ): Promise<Message> {
    if (options?.validateDTO) {
      await validateDTO(payload, SendMessageDTO)
    }

    return this.message.create(payload, {
      raw: true,
      transaction: options?.transaction,
    });
  }
}