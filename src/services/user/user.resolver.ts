import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from '../graphql/models/user.model';
import { GetUserArgs } from './dto/args/get-user.args';
import { CreateUserIfNotExistsInput } from './dto/input/create-user-if-not-exists.input';
import { UserService } from './user.service';
import { UpdateUserProfileArgs } from './dto/args/update-user.args';
import { Auth } from '../auth/decorators/auth.decorator';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Auth()
  @Query(() => User, { name: 'user', nullable: true })
  getUserById(@Args() getUserArgs: GetUserArgs): Promise<User | null> {
    return this.userService.getUser(getUserArgs);
  }

  @Auth()
  @Mutation(() => User)
  createUserIfNotExists(
    @Args('createUserIfNotExistsInput')
    createUserIfNotExistsInput: CreateUserIfNotExistsInput,
  ) {
    return this.userService.createUserIfNotExists(createUserIfNotExistsInput);
  }

  @Auth()
  @Mutation(() => User)
  updateUserProfile(@Args() updateUserProfileArgs: UpdateUserProfileArgs) {
    return this.userService.updateUser(updateUserProfileArgs);
  }
}
