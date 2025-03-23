import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from '../graphql/models/user.model';
import { GetUserArgs } from './dto/args/get-user.args';
import { CreateUserIfNotExistsInput } from './dto/input/create-user-if-not-exists.input';
import { UserService } from './user.service';

@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
  ) {}

  @Query(() => User, { name: 'user', nullable: true })
  getUserById(
    @Args() getUserArgs: GetUserArgs,
  ): Promise<User | null> {
    return this.userService.getUser(getUserArgs);
  }

  @Mutation(() => User)
  createUserIfNotExists(
    @Args('createUserIfNotExistsInput') createUserIfNotExistsInput: CreateUserIfNotExistsInput,
  ) {
    return this.userService.createUserIfNotExists(createUserIfNotExistsInput);
  }
}
