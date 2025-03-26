import { registerEnumType } from "@nestjs/graphql";

export enum UserRole {
  REGISTERED = 'REGISTERED',
  GUEST = 'GUEST',
}

export enum UserGender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  RATHERNOTSAY = "RATHER_NOT_SAY",
}

registerEnumType(UserRole, {
  name: 'UserRoleType',
});

registerEnumType(UserGender, {
  name: "UserGenderType"
})