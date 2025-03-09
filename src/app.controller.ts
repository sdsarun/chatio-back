import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { User } from './database/models/user.model';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get("/test")
  async getTest() {
    User.create({
      username: "sdfsdfsdf" + Math.random().toFixed(3)
    })
    return {
      users: await User.findAll(),
    }
  }
}
