import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User as UserModel } from '../../database/models/user.model';
import { User } from '../graphql/models/user.model';
import { GetUserArgs } from './dto/args/get-user.args';
import { WhereOptions } from 'sequelize';
import { Op } from 'sequelize';
import { isDeepEmpty } from '../../shared/utils/validation/common.validation';
import { CreateUserIfNotExistsInput } from './dto/input/create-user-if-not-exists.input';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserModel) private readonly user: typeof UserModel,
  ) {}

  async getUser(payload: GetUserArgs): Promise<User | null> {
    if (isDeepEmpty(payload)) {
      throw new Error('Arguments is empty.');
    }

    const where: WhereOptions<UserModel> = {};

    if (payload?.userId) {
      where.id = payload.userId;
    }

    if (payload?.aka) {
      where.aka = {
        [Op.like]: `%${payload.aka.toLowerCase()}%`,
      };
    }

    if (payload?.username) {
      where.aka = {
        [Op.like]: `%${payload.username.toLowerCase()}%`,
      };
    }

    const user = await this.user.findOne({
      where,
      raw: true,
    });

    return user as User;
  }

  async createUserIfNotExists(
    payload: CreateUserIfNotExistsInput,
  ): Promise<User> {
    const [userCreated] = await this.user.upsert(
      {
        ...payload,
        aka: payload?.aka || payload.username,
      },
      { returning: true },
    );
    return userCreated as User;
  }
}
