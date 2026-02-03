import { Body, Controller, Post, Returns, type RequestContext } from "adorn-api";
import {
  AuthLoginRequestDto,
  AuthLoginResponseDto
} from "../dtos/auth/auth.dtos";
import { AuthService } from "../services/auth.service";

@Controller("/auth")
export class AuthController {
  private readonly service = new AuthService();

  @Post("/login")
  @Body(AuthLoginRequestDto)
  @Returns(AuthLoginResponseDto)
  async login(ctx: RequestContext<AuthLoginRequestDto>): Promise<AuthLoginResponseDto> {
    return this.service.login(ctx.body as AuthLoginRequestDto);
  }
}
