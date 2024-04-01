import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import { LocalAuthGuard } from './auth/local-auth.guard';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    public configServie: ConfigService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async handleLogin(@Request() req) {
    return req.user;
  }
}
