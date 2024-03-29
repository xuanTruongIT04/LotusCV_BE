import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Render("home")
  @Get()
  handleHomePage() {
    const sayHelloWorld = this.getHello();
    return {
      sayHelloWorld: sayHelloWorld,
    }
    // return this.appService.getHello();
  }

  @Get()
  getHello() {
    return this.appService.getHello();
  }
}
