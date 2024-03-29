import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    public configServie: ConfigService,
  ) {}

  @Render('home')
  @Get()
  handleHomePage() {
    console.log(">>> CHECK PORT: ", this.configServie.get<string>("PORT"));
    
    const sayHelloWorld = this.getHello();
    return {
      sayHelloWorld: sayHelloWorld,
    };
    // return this.appService.getHello();
  }

  @Get()
  getHello() {
    return this.appService.getHello();
  }
}
