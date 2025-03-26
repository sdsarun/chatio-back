import { registerEnumType } from "@nestjs/graphql";

export enum UserRole {
  Registered = 'REGISTERED',
  Guest = 'GUEST',
}

export enum UserGender {
  Male = "MALE",
  Female = "FEMALE",
  RatherNotSay = "RATHER_NOT_SAY",
}

registerEnumType(UserRole, {
  name: 'UserRole',
});

registerEnumType(UserGender, {
  name: "UserGender"
})