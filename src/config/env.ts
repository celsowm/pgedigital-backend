import "dotenv/config";

type DbEnv = {
  PGE_DIGITAL_HOST: string;
  PGE_DIGITAL_USER: string;
  PGE_DIGITAL_PASSWORD: string;
  PGE_DIGITAL_ENCRYPT: boolean;
  PGE_DIGITAL_TRUST_CERT: boolean;
  PGE_DIGITAL_DATABASE: string;
};

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
};

const parseBoolean = (value: string, key: string): boolean => {
  const normalized = value.trim().toLowerCase();
  if (["true", "1", "yes", "y"].includes(normalized)) return true;
  if (["false", "0", "no", "n"].includes(normalized)) return false;
  throw new Error(`Invalid boolean for ${key}: ${value}`);
};

let cached: DbEnv | null = null;

export const getDbEnv = (): DbEnv => {
  if (cached) return cached;
  cached = {
    PGE_DIGITAL_HOST: requireEnv("PGE_DIGITAL_HOST"),
    PGE_DIGITAL_USER: requireEnv("PGE_DIGITAL_USER"),
    PGE_DIGITAL_PASSWORD: requireEnv("PGE_DIGITAL_PASSWORD"),
    PGE_DIGITAL_ENCRYPT: parseBoolean(requireEnv("PGE_DIGITAL_ENCRYPT"), "PGE_DIGITAL_ENCRYPT"),
    PGE_DIGITAL_TRUST_CERT: parseBoolean(requireEnv("PGE_DIGITAL_TRUST_CERT"), "PGE_DIGITAL_TRUST_CERT"),
    PGE_DIGITAL_DATABASE: requireEnv("PGE_DIGITAL_DATABASE"),
  };
  return cached;
};
