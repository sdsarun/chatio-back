import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { MasterUserRole } from '../../database/models/master-user-role.model';
import { MasterConversationType } from '../../database/models/master-conversation-type.model';
import { MasterService } from './master.service';
import { MasterUserGender } from '../../database/models/master-user-gender.model';

@Module({
  imports: [
    SequelizeModule.forFeature([MasterUserRole, MasterConversationType, MasterUserGender]),
  ],
  providers: [MasterService],
  exports: [MasterService, SequelizeModule]
})
export class MasterModule {}
