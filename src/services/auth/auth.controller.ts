import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { GoogleSignInDTO } from './dto/google-signin.dto';

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
  ): Promise<{ accessToken: string; accessTokenExpInMS: number }> {
    return this.authService.googleSignIn(body);
  }

  @Post('/guest')
  @ApiInternalServerErrorResponse({ description: 'Something went wrong in our server or bug', })
  @ApiUnauthorizedResponse({ description: 'id token invalid' })
  @ApiCreatedResponse({ description: 'Sign in complete.' })
  async handleGuestSignIn(): Promise<{ accessToken: string; accessTokenExpInMS: number }> {
    return this.authService.guestSignIn();
  }
}
