import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { MasterConversationType } from '../../database/models/master-conversation-type.model';
import { MasterUserGender } from '../../database/models/master-user-gender.model';
import { MasterUserRole } from '../../database/models/master-user-role.model';
import { ServiceActionOptions } from '../../shared/types/service-action';
import { validateDTO } from '../../shared/utils/validation/dto.validation';
import { UserRole } from '../graphql/models/user-role.model';
import { FindUserGenderByNameDTO } from './dto/find-user-gender-by-name.dto';
import { FindUserRoleByNameDTO } from './dto/find-user-role-by-name.dto';
import { FindUserRoleByIdDTO } from './dto/find-user-role-by-id.dto';
import { FindUserGenderByIdDTO } from './dto/find-user-gender-by-id.dto';
import { UserGender } from '../graphql/models/user-gender.model';

@Injectable()
export class MasterService {
  constructor(
    @InjectModel(MasterUserRole)
    private readonly userRole: typeof MasterUserRole,

    @InjectModel(MasterConversationType)
    private readonly ConversationType: typeof MasterConversationType,

    @InjectModel(MasterUserGender)
    private readonly userGender: typeof MasterUserGender
  ) {}

  async findUserRoleById(
    payload: FindUserRoleByIdDTO,
    options?: ServiceActionOptions
  ): Promise<UserRole | null> {
    if (options?.validateDTO) {
      await validateDTO(payload, FindUserRoleByIdDTO);
    }

    const userRole = await this.userRole.findByPk(payload.id, { raw: true });
    return userRole;
  }

  async findUserRoleByName(
    payload: FindUserRoleByNameDTO,
    options?: ServiceActionOptions,
  ): Promise<UserRole | null> {
    if (options?.validateDTO) {
      await validateDTO(payload, FindUserRoleByNameDTO);
    }

    return this.userRole.findOne({
      where: {
        name: payload.name,
      },
      raw: true,
    });
  }

  async findUserGenderById(
    payload: FindUserGenderByIdDTO,
    options?: ServiceActionOptions
  ): Promise<UserGender | null> {
    if (options?.validateDTO) {
      await validateDTO(payload, FindUserGenderByIdDTO);
    }

    const userGender = await this.userGender.findByPk(payload.id, { raw: true });
    return userGender;
  }

  async findUserGenderByName(
    payload: FindUserGenderByNameDTO,
    options?: ServiceActionOptions
  ): Promise<UserGender | null> {
    if (options?.validateDTO) {
      await validateDTO(payload, FindUserGenderByNameDTO);
    }

    return this.userGender.findOne({
      where: {
        name: payload.name
      },
      raw: true
    })
  }
}
