import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { WhereOptions } from 'sequelize';
import { User as UserModel } from '../../database/models/user.model';
import { ServiceActionOptions } from '../../shared/types/service-action';
import { validateDTO } from '../../shared/utils/validation/dto.validation';
import { User } from '../graphql/models/user.model';
import { MasterService } from '../master/master.service';
import { GetUserArgs } from './dto/args/get-user.args';
import { CreateUserIfNotExistsInput } from './dto/input/create-user-if-not-exists.input';
import { isDeepEmpty } from '../../shared/utils/validation/common.validation';
import { UserRole } from '../master/master.constants';
import randomUniqueName from '../../shared/utils/generators/random-unique-name.generator';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserModel) private readonly user: typeof UserModel,
    private readonly masterService: MasterService,
  ) {}

  async getUser(
    payload: GetUserArgs,
    options?: ServiceActionOptions,
  ): Promise<User | null> {
    if (options?.validateDTO) {
      await validateDTO(payload, GetUserArgs);
    }

    if (isDeepEmpty(payload)) {
      throw new Error('Args is empty.');
    }

    const where: WhereOptions<UserModel> = {};

    if (payload?.userId) {
      where.id = payload.userId;
    }

    if (payload?.aka) {
      where.aka = payload.aka.toLowerCase();
    }

    if (payload?.username) {
      where.username = payload.username.toLowerCase();
    }
      console.log("[LOG] - user.service.ts:46 - UserService - where:", where)

    const user = await this.user.findOne({
      where,
      raw: true,
      include: { all: true },
      nest: true,
    });

    return user as User;
  }

  async createUserIfNotExists(
    payload: CreateUserIfNotExistsInput,
    options?: ServiceActionOptions,
  ): Promise<User> {
    if (options?.validateDTO) {
      await validateDTO(payload, CreateUserIfNotExistsInput);
    }

    const [identifyRole, identifyGender] = await Promise.all([
      this.masterService.findUserRoleByName({ name: payload.role }),
      this.masterService.findUserGenderByName({ name: payload.gender }),
    ]);

    if (!identifyRole) {
      throw new Error('Role does not exists.');
    }

    if (!identifyGender) {
      throw new Error('Gender does not exists.');
    }

    const username: string =
      payload.role === UserRole.GUEST
        ? randomUniqueName().toLowerCase()
        : payload?.username?.toLowerCase();

    const aka: string =
      payload.role === UserRole.GUEST
        ? username
        : payload?.aka?.toLowerCase() || payload?.username?.toLowerCase();

    const [userCreated] = await this.user.upsert(
      {
        username,
        aka,
        userRoleId: identifyRole.id,
        userGenderId: identifyGender.id,
      },
      { returning: true },
    );

    return this.getUser({ userId: userCreated.id }) as Promise<User>;
  }
}
