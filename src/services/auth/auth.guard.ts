import { CanActivate, ExecutionContext, ForbiddenException, HttpException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';
import { Logger } from '../../logger/logger.service';
import { UserRole } from '../master/master.constants';
import { UserService } from '../user/user.service';
import { AUTH_PUBLIC_KEY } from './decorators/public.decorator';
import { AUTH_ROLES_KEY } from './decorators/roles.decorator';
import { TokenService } from './token.service';
import { VerifiedAccessTokenPayload } from './types/token-payload.types';
import { Socket } from 'socket.io';
import { SocketAuthPayload } from './types/socket-io.types';
import { WsException } from '@nestjs/websockets';
import { User } from '../graphql/models/user.model';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly logger: Logger,
    private readonly tokenService: TokenService,
    private readonly userService: UserService,
    private readonly reflector: Reflector,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    this.logger.setContext(AuthGuard.name);

    const type = context.getType<GqlContextType>();
    const { success, error, user } = await this.verifyUserCredentials(this.getAuthMetadataFromContext(context));
    if (!success) {
      if (type === "ws") throw new WsException(error);
      throw error;
    }

    this.attachDataToContext(context, { user });
    return success;
  }

  private extractBearerToken(bearerString: string): string | null {
    const [type, token] = bearerString.split(" ") || [];
    return type !== "Bearer" || !token ? null : token;
  }

  private getAuthMetadataFromContext(context: ExecutionContext): {
    isPublic: boolean;
    accessToken: string | null;
    roles: UserRole[]
  } {
    const type = context.getType<GqlContextType>();

    let accessToken: string | null = null
    try {
      switch (type) {
        case "graphql": {
          const ctx = GqlExecutionContext.create(context);
          const req = ctx.getContext().req as Request;
          accessToken = this.extractBearerToken(req.headers?.authorization || "");
          break;
        }
        case "http": {
          const req = context.switchToHttp().getRequest<Request>();
          accessToken = this.extractBearerToken(req.headers?.authorization || "");
          break;
        }
        case "ws": {
          const client = context.switchToWs().getClient<Socket>();
          const authPayload = client.handshake.auth as SocketAuthPayload;
          accessToken = this.extractBearerToken(authPayload?.token || "");
          break;
        }
        default: {
          throw new Error(`Unsupported context type: ${type}`);
        }
      }

      const isPublic = this.reflector
        .getAllAndMerge(AUTH_PUBLIC_KEY, [context.getHandler(), context.getClass()])
        .some((value) => value === true);

      const roles = this.reflector.getAllAndMerge<UserRole[]>(AUTH_ROLES_KEY, [context.getHandler(), context.getClass()]);

      return {
        roles,
        isPublic,
        accessToken
      }
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  private async verifyUserCredentials(payload: {
    isPublic: boolean;
    accessToken: string | null;
    roles: UserRole[];
  }): Promise<{ success: false; error: HttpException; user: null } | { success: true; error: null; user: User | null }> {
    const { isPublic, accessToken, roles } = payload;

    if (isPublic) {
      return { success: true, error: null, user: null };
    }

    if (!accessToken) {
      this.logger.warn('Authorization header missing or malformed. Expected format: Bearer <token>');
      return {
        success: false,
        error: new UnauthorizedException('Missing or malformed access token. Please include a valid token in the Authorization header using the format: Bearer <token>.'),
        user: null,
      };
    }

    try {
      const { userInfo: userInfoFromToken } = await this.tokenService.verifyAccessToken<VerifiedAccessTokenPayload>(accessToken);
      this.logger.debug(`Token verified successfully for user ID: ${userInfoFromToken?.id || 'unknown'}`);

      const userInfoFromDB = await this.userService.getUser({ userId: userInfoFromToken.id });

      if (!userInfoFromDB) {
        this.logger.warn(`User with ID ${userInfoFromToken.id} not found in the database.`);
        return {
          success: false,
          error: new NotFoundException(`User with ID ${userInfoFromToken.id} does not exist.`),
          user: null,
        };
      }

      const userRole = userInfoFromDB.userRole?.name as UserRole;

      if (!userRole) {
        this.logger.warn(`User with ID ${userInfoFromDB.id} has no assigned role.`);
        return {
          success: false,
          error: new ForbiddenException('Your account does not have a role assigned. Contact support.'),
          user: null,
        };
      }

      if (!roles.includes(userRole)) {
        this.logger.warn(`User role "${userRole}" not allowed to access this resource.`);
        return {
          success: false,
          error: new ForbiddenException(`Access denied. Your role "${userRole}" does not have permission to access this resource.`),
          user: null,
        };
      }

      return { success: true, error: null, user: userInfoFromDB };
    } catch (error) {
      this.logger.error(error);
      return {
        success: false,
        error: new UnauthorizedException('Invalid or expired access token. Please log in again.'),
        user: null,
      };
    }
  }

  private attachDataToContext(context: ExecutionContext, data: Record<string, any>): void {
    const type = context.getType<GqlContextType>();

    switch (type) {
      case 'http': {
        const req = context.switchToHttp().getRequest<Request>();
        Object.assign(req, data);
        break;
      }
      case 'graphql': {
        const req = GqlExecutionContext.create(context).getContext().req as Request;
        Object.assign(req, data);
        break;
      }
      case 'ws': {
        const client = context.switchToWs().getClient<Socket>();
        Object.assign(client.data, data);
        break;
      }
      default: {
        throw new Error(`Unsupported context type: ${type}`);
      }
    }
  }
}
