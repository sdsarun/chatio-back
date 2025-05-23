import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { Conversation } from '../../database/models/conversation.model';
import { ConversationParticipant } from '../../database/models/conversation-participant.model';
import { MasterModule } from '../master/master.module';
import { Message } from '../../database/models/message.model';
import { MessageRead } from '../../database/models/message-read.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Conversation,
      ConversationParticipant,
      Message,
      MessageRead,
    ]),
    AuthModule,
    UserModule,
    MasterModule,
  ],
  providers: [ChatService, ChatGateway],
})
export class ChatModule {}
