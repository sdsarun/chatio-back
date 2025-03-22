import { Args, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { User } from '../graphql/models/user.model';
import { UserService } from './user.service';
import { GetUserArgs } from './dto/args/get-user.args';
import { UserRole } from '../graphql/models/user-role.model';
import { MasterService } from '../master/master.service';
import { CreateUserIfNotExistsInput } from './dto/input/create-user-if-not-exists.input';

@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly masterService: MasterService,
  ) {}

  @Query(() => User, { name: 'user', nullable: true })
  getUserById(
    @Args() getUserArgs: GetUserArgs,
  ): Promise<User | null> {
    return this.userService.getUser(getUserArgs);
  }

  @ResolveField(() => UserRole, { name: 'userRole', nullable: true })
  async getUserRoleById(@Parent() user: User) {
    if (!user.userRoleId) {
      return null;
    }
    return this.masterService.findUserRoleById({ id: user.userRoleId });
  }

  @Mutation(() => User)
  createUserIfNotExists(
    @Args('createUserIfNotExistsInput') createUserIfNotExistsInput: CreateUserIfNotExistsInput,
  ) {
    return this.userService.createUserIfNotExists(createUserIfNotExistsInput);
  }
}
