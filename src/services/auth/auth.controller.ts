import { Body, Controller, Post, Res } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { GoogleSignInDTO } from './dto/google-signin.dto';
import { GuestSignInDTO } from './dto/guest-signin.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('/google')
  @ApiInternalServerErrorResponse({ description: 'Something went wrong in our server or bug', })
  @ApiBadRequestResponse({ description: 'Invalid DTO or mismatch types' })
  @ApiUnauthorizedResponse({ description: 'id token invalid' })
  @ApiForbiddenResponse({ description: "User account is inactive. Please contact support to activate your account." })
  @ApiCreatedResponse({ description: 'Sign in complete.' })
  async handleGoogleSignIn(
    @Body() body: GoogleSignInDTO,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string; accessTokenExpInMS: number }> {
    const { accessToken, accessTokenExpInMS } = await this.authService.googleSignIn(body);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      maxAge: accessTokenExpInMS,
    });

    return { accessToken, accessTokenExpInMS };
  }

  @Post('/guest')
  @ApiInternalServerErrorResponse()
  @ApiUnauthorizedResponse({ description: 'id token invalid' })
  @ApiCreatedResponse({ description: 'Sign in complete.' })
  async handleGuestSignIn(
    @Body() body: GuestSignInDTO,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string; accessTokenExpInMS: number }> {
    const { accessToken, accessTokenExpInMS } = await this.authService.guestSignIn(body);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      maxAge: accessTokenExpInMS,
    });

    return { accessToken, accessTokenExpInMS };
  }
}
