import { User } from "../../graphql/models/user.model"

export type AccessTokenPayload = {
  userInfo: User;
}

export type VerifiedAccessTokenPayload = AccessTokenPayload & {
  iat: number;
  exp: number;
  iss: string;
};