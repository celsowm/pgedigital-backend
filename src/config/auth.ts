const REQUIRED_ENV_VARS = ["PGE_DIGITAL_JWT_SECRET"] as const;

type RequiredEnv = typeof REQUIRED_ENV_VARS[number];

export interface AuthConfig {
  JWT_SECRET: string;
  JWT_EXPIRES_IN: number;
  JWT_EXPIRES_IN_SECONDS: number;
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

export function getAuthConfigFromEnv(): AuthConfig {
  const JWT_SECRET = requireEnv("PGE_DIGITAL_JWT_SECRET");
  const parsed = parseExpiresIn(process.env.PGE_DIGITAL_JWT_EXPIRES_IN);

  return {
    JWT_SECRET,
    JWT_EXPIRES_IN: parsed.expiresIn,
    JWT_EXPIRES_IN_SECONDS: parsed.seconds
  };
}
