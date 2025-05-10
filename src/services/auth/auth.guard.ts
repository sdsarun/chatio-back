import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { WsException } from '@nestjs/websockets';
import { Request } from 'express';
import { Socket } from 'socket.io';
import { Logger } from '../../logger/logger.service';
import { UserRole } from '../master/master.constants';
import { AuthService } from './auth.service';
import { AUTH_PUBLIC_KEY } from './decorators/public.decorator';
import { AUTH_ROLES_KEY } from './decorators/roles.decorator';
import { SocketAuthPayload } from './types/socket-io.types';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly logger: Logger,
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    this.logger.setContext(AuthGuard.name);

    const type = context.getType<GqlContextType>();
    const { success, error, user } = await this.authService.authorize(this.getAuthMetadataFromContext(context));
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
    publicApiKey: string | null;
  } {
    const type = context.getType<GqlContextType>();

    let accessToken: string | null = null
    let publicApiKey: string | null = null;
    try {
      switch (type) {
        case "graphql": {
          const ctx = GqlExecutionContext.create(context);
          const req = ctx.getContext().req as Request;
          accessToken = this.extractBearerToken(req.headers?.authorization || "");
          publicApiKey = (req.headers?.["public-api-key"] || "") as string
          break;
        }
        case "http": {
          const req = context.switchToHttp().getRequest<Request>();
          accessToken = this.extractBearerToken(req.headers?.authorization || "");
          publicApiKey = (req.headers?.["public-api-key"] || "") as string
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
        accessToken,
        publicApiKey
      }
    } catch (error) {
      this.logger.error(error);
      throw error;
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
