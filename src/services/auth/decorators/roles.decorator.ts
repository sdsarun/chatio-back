import { SetMetadata } from "@nestjs/common";
import { UserRole } from "../../master/master.constants";

export const AUTH_ROLES_KEY = Symbol("auth_roles_key");
export const Roles = (...roles: UserRole[]) => SetMetadata(AUTH_ROLES_KEY, roles);