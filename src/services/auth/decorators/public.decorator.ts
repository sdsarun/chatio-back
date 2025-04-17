import { SetMetadata } from "@nestjs/common"

export const AUTH_PUBLIC_KEY = Symbol("auth_public_key")
export const Public = () => SetMetadata(AUTH_PUBLIC_KEY, true);