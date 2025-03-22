import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { MasterUserRole } from '../../database/models/master-user-role.model';
import { MasterConversationType } from '../../database/models/master-conversation-type.model';
import { UserRole as UserRoleConstants } from './master.constants';
import { UserRole } from '../graphql/models/user-role.model';

@Injectable()
export class MasterService {
  constructor(
    @InjectModel(MasterUserRole)
    private readonly userRole: typeof MasterUserRole,

    @InjectModel(MasterConversationType)
    private readonly ConversationType: typeof MasterConversationType,
  ) {}

  async findUserRoleById(payload: { id: string }): Promise<UserRole | null> {
    const userRole = await this.userRole.findByPk(payload.id, { raw: true });
    return userRole;
  }

  async findUserRoleByName(payload: {
    name: UserRoleConstants;
  }): Promise<UserRole | null> {
    return this.userRole.findOne({
      where: {
        name: payload.name,
      },
      raw: true,
    });
  }
}
