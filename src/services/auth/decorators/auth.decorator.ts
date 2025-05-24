import { applyDecorators } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { UserRole } from "../../master/master.constants";
import { Public } from "./public.decorator";
import { Roles } from "./roles.decorator";

export type AuthDecoratorValue = {
  roles?: UserRole[];
  isPublic?: boolean;
};

export function Auth(options: AuthDecoratorValue = {}) {
  const { 
    roles = [], 
    isPublic = false 
  } = options;

  const decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator> = [
    ApiBearerAuth(),
  ];

  if (isPublic) {
    decorators.push(Public());
  }

  if (roles.length === 0) {
    decorators.push(Roles(UserRole.REGISTERED, UserRole.GUEST));
  } else {
    decorators.push(Roles(...roles));
  }

  return applyDecorators(...decorators);
}
