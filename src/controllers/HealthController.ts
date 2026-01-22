import { Controller, Get, Returns, Dto, Field, t } from 'adorn-api';

@Dto()
class HealthResponse {
  @Field(t.string())
  status!: string;

  @Field(t.string())
  timestamp!: string;
}

@Controller({ path: '/health', tags: ['Health'] })
export class HealthController {
  @Get('/')
  @Returns(HealthResponse, { description: 'Health check response' })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString()
    };
  }
}
