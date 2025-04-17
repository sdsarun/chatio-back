import { CanActivate, ExecutionContext, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';
import { TokenService } from './token.service';
import { Logger } from '../../logger/logger.service';
import { Reflector } from '@nestjs/core';
import { AUTH_PUBLIC_KEY } from './decorators/public.decorator';
import { AUTH_ROLES_KEY } from './decorators/roles.decorator';
import { UserRole } from '../master/master.constants';
import { VerifiedAccessTokenPayload } from './types/token-payload.types';
import { UserService } from '../user/user.service';

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

    const req = this.getRequestFromContext(context);
    const { isPublic, accessToken, roles } = this.getAuthMetadata(context);
  
    if (isPublic) {
      return true;
    }
  
    if (!accessToken) {
      this.logger.warn('Authorization header missing or malformed. Expected format: Bearer <token>');
      throw new UnauthorizedException('Missing or malformed access token. Please include a valid token in the Authorization header using the format: Bearer <token>.');
    }
  
    try {
      const { userInfo: userInfoFromToken } = await this.tokenService.verifyAccessToken<VerifiedAccessTokenPayload>(accessToken);
      this.logger.debug(`Token verified successfully for user ID: ${userInfoFromToken?.id || 'unknown'}`);
  
      const userInfoFromDB = await this.userService.getUser({ userId: userInfoFromToken.id });
  
      if (!userInfoFromDB) {
        this.logger.warn(`User with ID ${userInfoFromToken.id} not found in the database.`);
        throw new NotFoundException(`User with ID ${userInfoFromToken.id} does not exist.`);
      }
  
      const userRole = userInfoFromDB.userRole?.name as UserRole;
  
      if (!userRole) {
        this.logger.warn(`User with ID ${userInfoFromDB.id} has no assigned role.`);
        throw new ForbiddenException('Your account does not have a role assigned. Contact support.');
      }
  
      if (!roles.includes(userRole)) {
        this.logger.warn(`User role "${userRole}" not allowed to access this resource.`);
        throw new ForbiddenException(`Access denied. Your role "${userRole}" does not have permission to access this resource.`);
      }
  
      this.attachDataToRequest(req, { user: userInfoFromDB });
    } catch (error) {
      this.logger.error(error);
      throw new UnauthorizedException(error?.message || 'Invalid or expired access token. Please log in again.');
    }
  
    return true;
  }

  private extractTokenFromReq(req: Request): string | null {
    const [type, token] = req.headers?.authorization?.split(" ") || [];
    return type !== "Bearer" || !token ? null : token;
  }

  private getRequestFromContext(context: ExecutionContext): Request {
    const type = context.getType<GqlContextType>();
    let req: Request;

    switch (type) {
      case "graphql": {
        const ctx = GqlExecutionContext.create(context);
        req = ctx.getContext().req;
        break;
      }
      case "http": {
        req = context.switchToHttp().getRequest<Request>();
        break;
      }

      default: {
        throw new Error(`Context ${type} not supported.`);
      }
    }

    return req;
  }

  private getAuthMetadata(
    context: ExecutionContext
  ): {
    isPublic: boolean;
    accessToken: string | null;
    roles: UserRole[]
  } {
    try {
      const req = this.getRequestFromContext(context);

      const accessToken = this.extractTokenFromReq(req);
      const isPublic = this.reflector
        .getAllAndMerge(AUTH_PUBLIC_KEY, [context.getHandler(), context.getClass()])
        .some((value) => value === true);
      
      const roles = this.reflector.getAllAndMerge<UserRole[]>(AUTH_ROLES_KEY, [context.getHandler(), context.getClass()]);

      return {
        isPublic,
        accessToken,
        roles
      }
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  private attachDataToRequest(
    req: Request,
    data: Record<string, any>,
  ) {
    for (const [key, value] of Object.entries(data)) {
      req[key] = value;
    }
  }
}
