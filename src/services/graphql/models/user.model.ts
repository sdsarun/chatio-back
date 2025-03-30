import { Field, ID, ObjectType } from '@nestjs/graphql';
import { UserRole } from './user-role.model';
import { UserGender } from './user-gender.model';

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;
  username: string;
  aka: string;
  userRoleId?: string;
  userGenderId?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  userRole?: UserRole;
  userGender?: UserGender;
}