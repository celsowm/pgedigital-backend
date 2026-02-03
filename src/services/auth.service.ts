import { HttpError } from "adorn-api";
import { sign, verify, type JwtPayload } from "jsonwebtoken";
import { getAuthConfigFromEnv } from "../config/auth";
import { withSession } from "../db/mssql";
import type { AuthLoginRequestDto, AuthLoginResponseDto } from "../dtos/auth/auth.dtos";
import { UsuarioRepository } from "../repositories/usuario.repository";
import { LdapService } from "./ldap.service";

type AuthTokenPayload = {
  login: string;
  nome?: string;
  grupos?: string[];
  usuario_id?: number | null;
};

type RefreshTokenPayload = JwtPayload & AuthTokenPayload & { type: "refresh" };

type AuthLoginResult = AuthLoginResponseDto & { refresh_token: string };

type AuthRefreshResult = {
  access_token: string;
  refresh_token: string;
  token_type: "Bearer";
  expires_in: number;
};

export class AuthService {
  private readonly ldapService = new LdapService();
  private readonly usuarioRepository = new UsuarioRepository();

  async login(input: AuthLoginRequestDto): Promise<AuthLoginResult> {
    const login = (input.login ?? "").trim();
    const senha = (input.senha ?? "").trim();

    if (!login || !senha) {
      throw new HttpError(400, "Login e senha são obrigatórios.");
    }

    const loginResult = await this.ldapService.login(login, senha);
    if (!loginResult.ok) {
      if (loginResult.error === "52e") {
        throw new HttpError(401, "Senha incorreta. Por favor, tente novamente.");
      }
      if (loginResult.error === "532") {
        throw new HttpError(403, "Senha expirada. Por favor, verifique.");
      }
      if (loginResult.error === "login") {
        throw new HttpError(401, "Login incorreto. Por favor, tente novamente.");
      }
      throw new HttpError(401, "Falha de autenticação.");
    }

    let ldapUser: Awaited<ReturnType<LdapService["get_ad_users"]>>;
    try {
      ldapUser = await this.ldapService.get_ad_users(login, senha);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Usuário não autorizado no AD.";
      throw new HttpError(403, message);
    }
    if (ldapUser === "desativado") {
      throw new HttpError(403, "Usuário inativado na rede! Favor verificar.");
    }

    const usuario = await withSession(async (session) => {
      return this.usuarioRepository.findByLogin(session, login);
    });

    const authConfig = getAuthConfigFromEnv();
    const subject = ldapUser.login ?? login;
    const payload: AuthTokenPayload = {
      login: ldapUser.login ?? login,
      nome: ldapUser.nome,
      grupos: ldapUser.grupos ?? [],
      usuario_id: usuario?.id ?? null
    };
    const access_token = this.buildAccessToken(payload, subject);
    const refresh_token = this.buildRefreshToken(payload, subject);

    return {
      access_token,
      refresh_token,
      token_type: "Bearer",
      expires_in: authConfig.JWT_EXPIRES_IN_SECONDS,
      ldap: ldapUser,
      usuario: usuario ?? null
    };
  }

  async refresh(refreshToken: string): Promise<AuthRefreshResult> {
    if (!refreshToken) {
      throw new HttpError(401, "Refresh token ausente.");
    }

    const authConfig = getAuthConfigFromEnv();
    const payload = this.verifyRefreshToken(refreshToken, authConfig.JWT_REFRESH_SECRET);
    const subject = payload.sub ?? payload.login;
    const access_token = this.buildAccessToken(payload, subject);
    const refresh_token = this.buildRefreshToken(payload, subject);

    return {
      access_token,
      refresh_token,
      token_type: "Bearer",
      expires_in: authConfig.JWT_EXPIRES_IN_SECONDS
    };
  }

  private buildAccessToken(payload: AuthTokenPayload, subject: string): string {
    const authConfig = getAuthConfigFromEnv();
    return sign(payload, authConfig.JWT_SECRET, {
      expiresIn: authConfig.JWT_EXPIRES_IN,
      subject
    });
  }

  private buildRefreshToken(payload: AuthTokenPayload, subject: string): string {
    const authConfig = getAuthConfigFromEnv();
    const refreshPayload: RefreshTokenPayload = {
      ...payload,
      type: "refresh"
    };
    return sign(refreshPayload, authConfig.JWT_REFRESH_SECRET, {
      expiresIn: authConfig.JWT_REFRESH_EXPIRES_IN,
      subject
    });
  }

  private verifyRefreshToken(token: string, secret: string): RefreshTokenPayload {
    try {
      const decoded = verify(token, secret);
      if (!decoded || typeof decoded !== "object") {
        throw new Error("Invalid refresh token.");
      }
      const payload = decoded as RefreshTokenPayload;
      if (payload.type !== "refresh" || !payload.login) {
        throw new Error("Invalid refresh token.");
      }
      return payload;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Refresh token inválido.";
      throw new HttpError(401, message);
    }
  }
}
