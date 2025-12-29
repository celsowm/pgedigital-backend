import { Controller, Get } from 'adorn-api';

@Controller('/api/test')
export class TestController {
  @Get('/')
  async test() {
    return { message: 'Adorn-API is working!' };
  }
}