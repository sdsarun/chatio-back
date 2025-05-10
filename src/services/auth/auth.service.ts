import { HttpService } from '@nestjs/axios';
import { ForbiddenException, HttpException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ConfigurationService } from '../../configuration/configuration.service';
import { Logger } from '../../logger/logger.service';
import { ServiceActionOptions } from '../../shared/types/service-action';
import { validateDTO } from '../../shared/utils/validation/dto.validation';
import { UserRole } from '../master/master.constants';
import { UserService } from '../user/user.service';
import { GoogleSignInDTO } from './dto/google-signin.dto';
import { TokenService } from './token.service';
import { GoogleIdTokenPayload } from './types/google.types';
import { isAxiosError } from 'axios';
import { VerifyGoogleIDTokenError } from '../../common/exceptions/google-oauth.exception';
import { AccessTokenPayload, VerifiedAccessTokenPayload } from './types/token-payload.types';
import { User } from '../graphql/models/user.model';

@Injectable()
export class AuthService {
  constructor(
    private readonly logger: Logger,
    private readonly tokenService: TokenService,
    private readonly http: HttpService,
    private readonly configurationService: ConfigurationService,
    private readonly userService: UserService
  ) { }

  async googleSignIn(
    payload: GoogleSignInDTO,
    options?: ServiceActionOptions,
  ): Promise<{
    accessToken: string;
    accessTokenExpInMS: number;
  }> {
    this.logger.setContext(this.googleSignIn.name)

    try {
      if (options?.validateDTO) {
        await validateDTO(payload, GoogleSignInDTO);
      }

      const { email } = await this.verifyGoogleIDToken(payload);

      const userInfo = await this.userService.createUserIfNotExists({ username: email, role: UserRole.REGISTERED })

      if (!userInfo.isActive) {
        throw new ForbiddenException('User account is inactive. Please contact support to activate your account.');
      }

      const tokenPayload: AccessTokenPayload = {
        userInfo
      }

      const accessToken = await this.tokenService.generateAccessToken(tokenPayload);
      const { exp: accessTokenExpInMS } = this.tokenService.decode(accessToken);

      return {
        accessToken,
        accessTokenExpInMS: accessTokenExpInMS * 1000,
      };

    } catch (error) {
      if (isAxiosError(error)) {
        this.logger.error(error.response?.data);
        const googleErrorMessage = error.response?.data as { error: string };
        throw new VerifyGoogleIDTokenError(googleErrorMessage.error)
      }
      throw error;
    }
  }

  async guestSignIn(): Promise<{
    accessToken: string;
    accessTokenExpInMS: number;
  }> {
    this.logger.setContext(this.googleSignIn.name)
    try {
      const userInfo = await this.userService.createUserIfNotExists({ role: UserRole.GUEST });

      const tokenPayload: AccessTokenPayload = {
        userInfo
      }

      const accessToken = await this.tokenService.generateAccessToken(tokenPayload);
      const { exp: accessTokenExpInMS } = this.tokenService.decode(accessToken);

      return {
        accessToken,
        accessTokenExpInMS: accessTokenExpInMS * 1000,
      };
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  private async verifyGoogleIDToken({ idToken }: GoogleSignInDTO): Promise<GoogleIdTokenPayload> {
    this.logger.setContext(this.googleSignIn.name)
    try {
      const { data } = await firstValueFrom(
        this.http.get<GoogleIdTokenPayload>('https://oauth2.googleapis.com/tokeninfo', {
          params: { id_token: idToken },
        })
      );

      const validIssuers = ['accounts.google.com', 'https://accounts.google.com'];

      if (!validIssuers.includes(data.iss)) {
        throw new Error(`Invalid issuer: expected one of ${validIssuers.join(', ')}, got "${data.iss}"`);
      }

      if (data.aud !== this.configurationService.oauthGoogleConfig.clientId) {
        throw new Error(`Invalid audience: expected "${this.configurationService.oauthGoogleConfig.clientId}", got "${data.aud}"`);
      }

      return data;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async authorize(
    payload: {
      isPublic: boolean;
      accessToken: string | null;
      roles: UserRole[];
      publicApiKey?: string | null;
    },
    options?: {
      skipCheckPublicApiKey?: boolean;
    }
  ): Promise<{ success: false; error: HttpException; user: null } | { success: true; error: null; user: User | null }> {
    this.logger.setContext(this.authorize.name)

    const { isPublic, accessToken, roles, publicApiKey = "" } = payload;

    if (isPublic) {
      if (options?.skipCheckPublicApiKey) {
        return { success: true, error: null, user: null };
      }

      if (this.configurationService.authConfig.publicApiKey !== publicApiKey) {
        return {
          success: false,
          error: new UnauthorizedException("Invalid public api key."),
          user: null,
        }
      }

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
}
