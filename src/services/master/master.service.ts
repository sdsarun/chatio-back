import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { MasterUserRole } from '../../database/models/master-user-role.model';
import { MasterConversationType } from '../../database/models/master-conversation-type.model';
import { UserRole } from './master.constants';

@Injectable()
export class MasterService {
  constructor(
    @InjectModel(MasterUserRole)
    private readonly userRole: typeof MasterUserRole,

    @InjectModel(MasterConversationType)
    private readonly ConversationType: typeof MasterConversationType,
  ) {}

  async findUserRoleById(payload: { id: string }) {
    return this.userRole.findByPk(payload.id, {
      raw: true,
    });
  }

  async findUserRoleByName(payload: { name: UserRole }) {
    return this.userRole.findOne({
      where: {
        name: payload.name,
      },
      raw: true,
    });
  }
}
