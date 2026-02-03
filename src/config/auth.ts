const REQUIRED_ENV_VARS = ["PGE_DIGITAL_JWT_SECRET", "PGE_DIGITAL_JWT_REFRESH_SECRET"] as const;

type RequiredEnv = typeof REQUIRED_ENV_VARS[number];

export interface AuthConfig {
  JWT_SECRET: string;
  JWT_EXPIRES_IN: number;
  JWT_EXPIRES_IN_SECONDS: number;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES_IN: number;
  JWT_REFRESH_EXPIRES_IN_SECONDS: number;
  COOKIE_NAME: string;
  COOKIE_SECURE: boolean;
  COOKIE_SAME_SITE: "lax" | "strict" | "none";
  COOKIE_DOMAIN?: string;
  COOKIE_PATH: string;
}

function requireEnv(name: RequiredEnv): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function parseExpiresIn(value?: string): { expiresIn: number; seconds: number } {
  if (!value) {
    const seconds = 8 * 60 * 60;
    return { expiresIn: seconds, seconds };
  }

  if (/^\d+$/.test(value)) {
    const seconds = Number(value);
    return { expiresIn: seconds, seconds };
  }

  const match = value.trim().match(/^(\d+)([smhd])$/i);
  if (!match) {
    throw new Error(`Invalid PGE_DIGITAL_JWT_EXPIRES_IN value: ${value}`);
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multiplier = unit === "s" ? 1 : unit === "m" ? 60 : unit === "h" ? 3600 : 86400;
  const seconds = amount * multiplier;
  return { expiresIn: seconds, seconds };
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (!value) {
    return fallback;
  }
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "y"].includes(normalized)) {
    return true;
  }
  if (["0", "false", "no", "n"].includes(normalized)) {
    return false;
  }
  return fallback;
}

function parseSameSite(value?: string): "lax" | "strict" | "none" {
  if (!value) {
    return "lax";
  }
  const normalized = value.trim().toLowerCase();
  if (normalized === "strict") {
    return "strict";
  }
  if (normalized === "none") {
    return "none";
  }
  return "lax";
}

export function getAuthConfigFromEnv(): AuthConfig {
  const JWT_SECRET = requireEnv("PGE_DIGITAL_JWT_SECRET");
  const parsed = parseExpiresIn(process.env.PGE_DIGITAL_JWT_EXPIRES_IN);
  const JWT_REFRESH_SECRET = requireEnv("PGE_DIGITAL_JWT_REFRESH_SECRET");
  const refreshParsed = parseExpiresIn(
    process.env.PGE_DIGITAL_JWT_REFRESH_EXPIRES_IN ?? "7d"
  );
  const COOKIE_NAME = (process.env.PGE_DIGITAL_AUTH_COOKIE_NAME ?? "pge_digital_refresh").trim();
  const COOKIE_SAME_SITE = parseSameSite(process.env.PGE_DIGITAL_AUTH_COOKIE_SAME_SITE);
  const COOKIE_SECURE = COOKIE_SAME_SITE === "none"
    ? true
    : parseBoolean(process.env.PGE_DIGITAL_AUTH_COOKIE_SECURE, false);
  const COOKIE_DOMAIN = process.env.PGE_DIGITAL_AUTH_COOKIE_DOMAIN?.trim() || undefined;
  const COOKIE_PATH = (process.env.PGE_DIGITAL_AUTH_COOKIE_PATH ?? "/auth").trim();

  return {
    JWT_SECRET,
    JWT_EXPIRES_IN: parsed.expiresIn,
    JWT_EXPIRES_IN_SECONDS: parsed.seconds,
    JWT_REFRESH_SECRET,
    JWT_REFRESH_EXPIRES_IN: refreshParsed.expiresIn,
    JWT_REFRESH_EXPIRES_IN_SECONDS: refreshParsed.seconds,
    COOKIE_NAME,
    COOKIE_SECURE,
    COOKIE_SAME_SITE,
    COOKIE_DOMAIN,
    COOKIE_PATH
  };
}
