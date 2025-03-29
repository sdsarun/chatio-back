import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { col, fn, Op, where, WhereOptions } from 'sequelize';
import { User as UserModel } from '../../database/models/user.model';
import { ServiceActionOptions } from '../../shared/types/service-action';
import randomUniqueName from '../../shared/utils/generators/random-unique-name.generator';
import { isDeepEmpty } from '../../shared/utils/validation/common.validation';
import { validateDTO } from '../../shared/utils/validation/dto.validation';
import { User } from '../graphql/models/user.model';
import { UserRole } from '../master/master.constants';
import { MasterService } from '../master/master.service';
import { GetUserArgs } from './dto/args/get-user.args';
import { CreateUserIfNotExistsInput } from './dto/input/create-user-if-not-exists.input';

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
      queryConditions.push(where(fn('LOWER', col('aka')), payload.aka.toLowerCase()));
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
      payload.role === UserRole.GUEST ? randomUniqueName() : payload?.username;

    const aka: string =
      payload.role === UserRole.GUEST
        ? username
        : payload?.aka || payload?.username;

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
