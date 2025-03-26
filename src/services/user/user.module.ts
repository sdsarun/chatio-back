import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../../database/models/user.model';
import { MasterModule } from '../master/master.module';

@Module({
  imports: [SequelizeModule.forFeature([User]), MasterModule],
  providers: [UserService, UserResolver],
  exports: [UserService, SequelizeModule],
})
export class UserModule {}
