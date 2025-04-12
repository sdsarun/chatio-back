import { HttpService } from '@nestjs/axios';
import { ForbiddenException, Injectable } from '@nestjs/common';
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
import { GuestSignInDTO } from './dto/guest-signin.dto';
import { isAxiosError } from 'axios';
import { VerifyGoogleIDTokenError } from '../../common/exceptions/google-oauth.exception';

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

      const accessToken = await this.tokenService.generateAccessToken(userInfo);
      const { exp: accessTokenExpInMS } = this.tokenService.decode(accessToken);

      return {
        accessToken,
        accessTokenExpInMS,
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

  async guestSignIn(
    payload: GuestSignInDTO,
    options?: ServiceActionOptions,
  ): Promise<{
    accessToken: string;
    accessTokenExpInMS: number;
  }> {
    this.logger.setContext(this.googleSignIn.name)
    try {
      if (options?.validateDTO) {
        await validateDTO(payload, GuestSignInDTO);
      }

      const userInfo = await this.userService.createUserIfNotExists({ role: UserRole.GUEST });

      const accessToken = await this.tokenService.generateAccessToken(userInfo);
      const { exp: accessTokenExpInMS } = this.tokenService.decode(accessToken);

      return {
        accessToken,
        accessTokenExpInMS,
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
}
