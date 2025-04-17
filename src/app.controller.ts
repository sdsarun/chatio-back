import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Auth } from './services/auth/decorators/auth.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Auth({ isPublic: true })
  getHello(): string {
    return this.appService.getHello();
  }
}
