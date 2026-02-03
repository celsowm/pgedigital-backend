import { HttpError } from "adorn-api";
import { sign } from "jsonwebtoken";
import { getAuthConfigFromEnv } from "../config/auth";
import { withSession } from "../db/mssql";
import type { AuthLoginRequestDto, AuthLoginResponseDto } from "../dtos/auth/auth.dtos";
import { UsuarioRepository } from "../repositories/usuario.repository";
import { LdapService } from "./ldap.service";

export class AuthService {
  private readonly ldapService = new LdapService();
  private readonly usuarioRepository = new UsuarioRepository();

  async login(input: AuthLoginRequestDto): Promise<AuthLoginResponseDto> {
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
    const payload = {
      login: ldapUser.login ?? login,
      nome: ldapUser.nome,
      grupos: ldapUser.grupos ?? [],
      usuario_id: usuario?.id ?? null
    };
    const access_token = sign(payload, authConfig.JWT_SECRET, {
      expiresIn: authConfig.JWT_EXPIRES_IN,
      subject
    });

    return {
      access_token,
      token_type: "Bearer",
      expires_in: authConfig.JWT_EXPIRES_IN_SECONDS,
      ldap: ldapUser,
      usuario: usuario ?? null
    };
  }
}
