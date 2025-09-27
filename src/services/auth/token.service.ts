import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigurationService } from '../../configuration/configuration.service';

@Injectable()
export class TokenService {
  constructor(
    private readonly configurationService: ConfigurationService,
    private readonly jwtService: JwtService,
  ) {}

  decode<T extends { exp: number }>(token: string): T {
    return this.jwtService.decode<T>(token);
  }

  async generateAccessToken(payload: Record<string, any>): Promise<string> {
    return this.jwtService.signAsync(payload, this.configurationService.jwtConfig.accessTokenConfig);
  }

  async verifyAccessToken<T extends object = any>(token: string): Promise<T> {
    return this.jwtService.verifyAsync<T>(token, this.configurationService.jwtConfig.accessTokenConfig);
  }
}
