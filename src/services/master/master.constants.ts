import { registerEnumType } from "@nestjs/graphql";

export enum UserRole {
  REGISTERED = 'REGISTERED',
  GUEST = 'GUEST',
}

export enum UserGender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  RATHER_NOT_SAY = "RATHER_NOT_SAY",
}

export enum ConversationType {
  DIRECT_MESSAGE = "DIRECT_MESSAGE",
  PRIVATE_GROUP_MESSAGE = "PRIVATE_GROUP_MESSAGE",
  PUBLIC_GROUP_MESSAGE = "PUBLIC_GROUP_MESSAGE",
  STRANGER_MESSAGE = "STRANGER_MESSAGE",
}

registerEnumType(UserRole, {
  name: 'UserRoleType',
});

registerEnumType(UserGender, {
  name: "UserGenderType"
});

registerEnumType(ConversationType, {
  name: "ConversationType"
});