import { Client, type Entry, type SearchOptions } from "ldapts";
import { getLdapConfigFromEnv, type LdapConfig } from "../config/ldap";

export interface LdapUser {
  nome?: string;
  login?: string;
  cargo?: string;
  unidade?: string;
  mail?: string;
  grupos?: string[];
  nome_ad?: string;
  thumbnailphoto?: string;
}

export type LdapLoginResult =
  | { ok: true }
  | { ok: false; error: "login" | "52e" | "532" | string };

export class LdapService {
  private readonly SERVER: string;
  private readonly USER_ADMIN: string;
  private readonly PASS_ADMIN: string;
  private readonly DOMAIN: string;
  private readonly BASE_DN: string;
  private readonly PREFIX: string;
  private readonly ALLOWED_GROUPS: string[];

  constructor(config?: Partial<LdapConfig>) {
    const env = getLdapConfigFromEnv();
    this.SERVER = config?.SERVER ?? env.SERVER;
    this.USER_ADMIN = config?.USER_ADMIN ?? env.USER_ADMIN;
    this.PASS_ADMIN = config?.PASS_ADMIN ?? env.PASS_ADMIN;
    this.DOMAIN = config?.DOMAIN ?? env.DOMAIN;
    this.BASE_DN = config?.BASE_DN ?? env.BASE_DN;
    this.PREFIX = config?.PREFIX ?? env.PREFIX;
    this.ALLOWED_GROUPS = config?.ALLOWED_GROUPS ?? env.ALLOWED_GROUPS;
  }

  private normalizeUrl(server: string): string {
    if (server.startsWith("ldap://") || server.startsWith("ldaps://")) {
      return server;
    }
    return `ldap://${server}`;
  }

  private createClient(): Client {
    return new Client({
      url: this.normalizeUrl(this.SERVER),
      timeout: 5000,
      connectTimeout: 5000
    });
  }

  private async withClient<T>(handler: (client: Client) => Promise<T>): Promise<T> {
    const client = this.createClient();
    try {
      return await handler(client);
    } finally {
      try {
        await client.unbind();
      } catch {
        // ignore unbind errors
      }
    }
  }

  private async bind(client: Client, dn: string, password: string): Promise<void> {
    await client.bind(dn, password);
  }

  private escapeLdapFilterValue(value: string): string {
    return value
      .replace(/\\/g, "\\5c")
      .replace(/\*/g, "\\2a")
      .replace(/\(/g, "\\28")
      .replace(/\)/g, "\\29")
      .replace(/\0/g, "\\00");
  }

  private async search(
    client: Client,
    base: string,
    options: SearchOptions
  ): Promise<Entry[]> {
    const result = await client.search(base, options);
    return result.searchEntries ?? [];
  }

  private normalizeValue(value: unknown): string | undefined {
    if (typeof value === "string") {
      return value;
    }
    if (Buffer.isBuffer(value)) {
      return value.toString("base64");
    }
    return undefined;
  }

  private getValue(entry: Record<string, unknown>, key: string): string | undefined {
    const entryKey = Object.keys(entry).find(
      candidate => candidate.toLowerCase() === key.toLowerCase()
    );
    if (!entryKey) return undefined;
    const value = entry[entryKey];
    if (Array.isArray(value)) {
      return this.normalizeValue(value[0]);
    }
    return this.normalizeValue(value);
  }

  private getArray(entry: Record<string, unknown>, key: string): string[] | undefined {
    const entryKey = Object.keys(entry).find(
      candidate => candidate.toLowerCase() === key.toLowerCase()
    );
    if (!entryKey) return undefined;
    const value = entry[entryKey];
    if (Array.isArray(value)) {
      const normalized = value
        .map(item => this.normalizeValue(item))
        .filter((item): item is string => Boolean(item));
      return normalized.length ? normalized : undefined;
    }
    const normalized = this.normalizeValue(value);
    if (normalized) {
      return [normalized];
    }
    return undefined;
  }

  private dnToArray(dns: string[]): string[] {
    const values: string[] = [];
    for (const dn of dns) {
      const parts = dn.split(",");
      for (const part of parts) {
        const [_, rawValue] = part.split("=");
        if (rawValue) {
          values.push(rawValue.toUpperCase());
        }
      }
    }
    return Array.from(new Set(values));
  }

  private mapUser(entry: Record<string, unknown>): LdapUser {
    const memberOf = this.getArray(entry, "memberOf");
    return {
      nome: this.getValue(entry, "displayName"),
      login: this.getValue(entry, "sAMAccountName"),
      cargo: this.getValue(entry, "description") ?? this.getValue(entry, "title"),
      unidade: this.getValue(entry, "physicalDeliveryOfficeName") ?? this.getValue(entry, "department"),
      mail: this.getValue(entry, "mail"),
      thumbnailphoto: this.getValue(entry, "thumbnailPhoto"),
      grupos: memberOf ? this.dnToArray(memberOf) : undefined,
      nome_ad: this.getValue(entry, "distinguishedName")
    };
  }

  private buildNetbiosLogin(login: string): string {
    if (login.includes("\\") || login.includes("@")) {
      return login;
    }
    return `${this.PREFIX}\\${login}`;
  }

  private buildUpnLogin(login: string): string {
    if (login.includes("@") || login.includes("\\")) {
      return login;
    }
    return `${login}@${this.DOMAIN}`;
  }

  private extractLdapErrorData(error: Error): string | undefined {
    const message = error.message ?? "";
    const match = message.match(/data\s+([0-9a-fA-F]{3,})/);
    if (match && match[1]) {
      return match[1].toLowerCase();
    }
    return undefined;
  }

  private ensureAllowedGroups(grupos?: string[]): void {
    if (!this.ALLOWED_GROUPS.length) return;
    if (!grupos || !grupos.length) {
      throw new Error("Usuário não possui grupos no AD.");
    }
    const normalized = grupos.map(group => group.toUpperCase());
    const hasGroup = this.ALLOWED_GROUPS.some(group => normalized.includes(group));
    if (!hasGroup) {
      throw new Error(
        `Usuário não tem permissão para acesso pois não se encontra no(s) grupo(s) ${this.ALLOWED_GROUPS.join(", ")}.`
      );
    }
  }

  async getUsuario(login: string): Promise<LdapUser | null> {
    return this.withClient(async (client) => {
      await this.bind(client, this.buildUpnLogin(this.USER_ADMIN), this.PASS_ADMIN);

      const safeLogin = this.escapeLdapFilterValue(login);
      const filter = `(&(sAMAccountName=${safeLogin}))`;
      const results = await this.search(client, this.BASE_DN, {
        scope: "sub",
        filter,
        explicitBufferAttributes: ["thumbnailPhoto", "thumbnailphoto"]
      });

      if (!results.length) {
        return null;
      }
      return this.mapUser(results[0]);
    });
  }

  async login(login: string, senha: string): Promise<LdapLoginResult> {
    const usuario = await this.getUsuario(login);
    if (!usuario) {
      return { ok: false, error: "login" };
    }

    return this.withClient(async (client) => {
      const attempts = [this.buildNetbiosLogin(login)];
      const upnLogin = this.buildUpnLogin(login);
      if (!attempts.includes(upnLogin)) {
        attempts.push(upnLogin);
      }

      let lastError: Error | undefined;
      for (const attempt of attempts) {
        try {
          await this.bind(client, attempt, senha);
          return { ok: true };
        } catch (error) {
          lastError = error as Error;
        }
      }

      const data = lastError ? this.extractLdapErrorData(lastError) : undefined;
      return { ok: false, error: data ?? "login" };
    });
  }

  async get_ad_users(login: string, senha: string): Promise<LdapUser | "desativado"> {
    return this.withClient(async (client) => {
      await this.bind(client, this.buildUpnLogin(login), senha);

      let maxPwdAgeEntries: Record<string, unknown>[] = [];
      try {
        maxPwdAgeEntries = await this.search(client, this.BASE_DN, {
          scope: "base",
          filter: "objectclass=*",
          attributes: ["maxPwdAge"]
        });
      } catch {
        return "desativado";
      }

      if (!maxPwdAgeEntries.length) {
        return "desativado";
      }

      const safeLogin = this.escapeLdapFilterValue(login);
      const filter = `(|(sAMAccountName=${safeLogin}))`;
      const results = await this.search(client, this.BASE_DN, {
        scope: "sub",
        filter,
        explicitBufferAttributes: ["thumbnailPhoto", "thumbnailphoto"]
      });

      if (!results.length) {
        return "desativado";
      }

      const user = this.mapUser(results[0]);
      this.ensureAllowedGroups(user.grupos);
      return user;
    });
  }
}
