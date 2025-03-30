import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { col, fn, Op, where, WhereOptions } from 'sequelize';
import {
  UserCreation,
  User as UserModel,
} from '../../database/models/user.model';
import { ServiceActionOptions } from '../../shared/types/service-action';
import randomUniqueName from '../../shared/utils/generators/random-unique-name.generator';
import { isDeepEmpty } from '../../shared/utils/validation/common.validation';
import { validateDTO } from '../../shared/utils/validation/dto.validation';
import { User } from '../graphql/models/user.model';
import { UserRole } from '../master/master.constants';
import { MasterService } from '../master/master.service';
import { GetUserArgs } from './dto/args/get-user.args';
import { CreateUserIfNotExistsInput } from './dto/input/create-user-if-not-exists.input';
import { UserGender } from '../graphql/models/user-gender.model';
import { UpdateUserArgs } from './dto/args/update-user.args';

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

    const queryConditions: WhereOptions<UserModel>[] = [];
    const whereOptions: WhereOptions<UserModel> = {
      [Op.and]: queryConditions,
    };

    if (payload?.userId) {
      queryConditions.push({ id: payload.userId });
    }

    if (payload?.aka) {
      queryConditions.push(
        where(fn('LOWER', col('aka')), payload.aka.toLowerCase()),
      );
    }

    if (payload?.username) {
      queryConditions.push(
        where(fn('LOWER', col('username')), payload.username.toLowerCase()),
      );
    }

    const user = await this.user.findOne({
      where: whereOptions,
      raw: true,
      include: { all: true },
      nest: true,
    });

    if (!user) {
      return null;
    }

    // ensure return null for references
    if (!user.userGender?.id) {
      user.userGender = null as any;
    }

    // ensure return null for references
    if (!user.userRole?.id) {
      user.userRole = null as any;
    }

    return user as User;
  }

  // create user with username and role, (gender, aka are optional)
  async createUserIfNotExists(
    payload: CreateUserIfNotExistsInput,
    options?: ServiceActionOptions,
  ): Promise<User> {
    if (options?.validateDTO) {
      await validateDTO(payload, CreateUserIfNotExistsInput);
    }

    const identifyRole = await this.masterService.findUserRoleByName({
      name: payload.role,
    });

    if (!identifyRole) {
      throw new Error('Role does not exists.');
    }

    // # check user gender when provided(optional)
    let identifyGender: UserGender | null = null;
    if (payload?.gender) {
      identifyGender = await this.masterService.findUserGenderByName({
        name: payload.gender,
      });

      if (!identifyGender) {
        throw new Error('Gender does not exists.');
      }
    }

    const createUserPayload: UserCreation = {
      username: undefined,
      aka: undefined,
      userRoleId: identifyRole.id,
      userGenderId: identifyGender?.id,
    };

    switch (payload.role) {
      case UserRole.GUEST: {
        const randomUsername = randomUniqueName();
        createUserPayload.username = randomUsername;
        createUserPayload.aka = randomUsername;
        break;
      }

      case UserRole.REGISTERED: {
        createUserPayload.username = payload.username!;
        createUserPayload.aka = payload?.aka || payload.username;
        break;
      }

      default: {
        throw new Error('Unknow user role.');
      }
    }

    const [userCreated] = await this.user.upsert(createUserPayload, {
      returning: true,
    });

    return this.getUser({ userId: userCreated.id }) as Promise<User>;
  }

  async updateUser(
    payload: UpdateUserArgs,
    options?: ServiceActionOptions,
  ): Promise<User | null> {
    if (options?.validateDTO) {
      await validateDTO(payload, UpdateUserArgs);
    }

    const { id, updateUserData = {} } = payload;

    const updateUserPayload: Omit<UserCreation, 'id'> = {
      aka: updateUserData?.aka,
      userGenderId: updateUserData?.userGenderId,
      userRoleId: updateUserData?.userRoleId,
    };

    if (updateUserData.gender) {
      const identifyGender = await this.masterService.findUserGenderByName({
        name: updateUserData.gender,
      });

      if (!identifyGender) {
        throw new Error('Gender does not exists.');
      }

      updateUserPayload.userGenderId = identifyGender.id;
    }

    const [numOfUpdatedUsers] = await this.user.update(updateUserPayload, {
      where: { id },
    });

    if (numOfUpdatedUsers === 0) {
      return null;
    }

    return this.getUser({ userId: id }, options);
  }
}
