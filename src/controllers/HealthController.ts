import { Controller, Get } from "adorn-api";

@Controller("/health")
export class HealthController {
  @Get("/")
  async status() {
    return { status: "ok" };
  }
}
