import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GoogleSignInDTO {
  @ApiProperty({ description: 'id_token generate from google' })
  @IsString()
  idToken: string;
}
