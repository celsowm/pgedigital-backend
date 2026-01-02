import { Controller, Get } from "adorn-api";

@Controller("/health")
export class HealthController {
  @Get("/")
  async status(): Promise<{ status: string }> {
    return { status: "ok" };
  }
}
