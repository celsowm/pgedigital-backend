import { Body, Controller, Post, Returns, type RequestContext } from "adorn-api";
import {
  AuthLoginRequestDto,
  AuthLoginResponseDto,
  AuthRefreshResponseDto
} from "../dtos/auth/auth.dtos";
import { AuthService } from "../services/auth.service";
import { getAuthConfigFromEnv } from "../config/auth";

function getCookieValue(cookieHeader: string | undefined, name: string): string | undefined {
  if (!cookieHeader) {
    return undefined;
  }
  const parts = cookieHeader.split(";").map(part => part.trim());
  for (const part of parts) {
    if (!part) {
      continue;
    }
    const separatorIndex = part.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }
    const key = part.slice(0, separatorIndex).trim();
    if (key !== name) {
      continue;
    }
    const rawValue = part.slice(separatorIndex + 1);
    return decodeURIComponent(rawValue);
  }
  return undefined;
}

@Controller("/auth")
export class AuthController {
  private readonly service = new AuthService();

  @Post("/login")
  @Body(AuthLoginRequestDto)
  @Returns(AuthLoginResponseDto)
  async login(ctx: RequestContext<AuthLoginRequestDto>): Promise<AuthLoginResponseDto> {
    const { refresh_token, ...response } = await this.service.login(ctx.body as AuthLoginRequestDto);
    this.setRefreshCookie(ctx, refresh_token);
    return response;
  }

  @Post("/refresh")
  @Returns(AuthRefreshResponseDto)
  async refresh(ctx: RequestContext): Promise<AuthRefreshResponseDto> {
    const authConfig = getAuthConfigFromEnv();
    const refreshToken = getCookieValue(ctx.req.headers.cookie, authConfig.COOKIE_NAME);
    const { refresh_token, ...response } = await this.service.refresh(refreshToken ?? "");
    this.setRefreshCookie(ctx, refresh_token);
    return response;
  }

  @Post("/logout")
  async logout(ctx: RequestContext): Promise<void> {
    const authConfig = getAuthConfigFromEnv();
    ctx.res.clearCookie(authConfig.COOKIE_NAME, {
      httpOnly: true,
      secure: authConfig.COOKIE_SECURE,
      sameSite: authConfig.COOKIE_SAME_SITE,
      domain: authConfig.COOKIE_DOMAIN,
      path: authConfig.COOKIE_PATH
    });
  }

  private setRefreshCookie(ctx: RequestContext, token: string): void {
    const authConfig = getAuthConfigFromEnv();
    ctx.res.cookie(authConfig.COOKIE_NAME, token, {
      httpOnly: true,
      secure: authConfig.COOKIE_SECURE,
      sameSite: authConfig.COOKIE_SAME_SITE,
      domain: authConfig.COOKIE_DOMAIN,
      path: authConfig.COOKIE_PATH,
      maxAge: authConfig.JWT_REFRESH_EXPIRES_IN_SECONDS * 1000
    });
  }
}
