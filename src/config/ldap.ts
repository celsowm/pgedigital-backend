const REQUIRED_ENV_VARS = [
  "PGE_DIGITAL_LDAP",
  "PGE_DIGITAL_LDAP_USERNAME",
  "PGE_DIGITAL_LDAP_PASSWORD",
  "PGE_DIGITAL_DOMAIN"
] as const;

type RequiredEnv = typeof REQUIRED_ENV_VARS[number];

export interface LdapConfig {
  SERVER: string;
  USER_ADMIN: string;
  PASS_ADMIN: string;
  DOMAIN: string;
  BASE_DN: string;
  PREFIX: string;
  ALLOWED_GROUPS: string[];
}

function requireEnv(name: RequiredEnv): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function parseGroups(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map(item => item.trim())
    .filter(Boolean)
    .map(item => item.toUpperCase());
}

function getDomainPrefix(domain: string): string {
  const [prefix] = domain.split(".");
  return (prefix ?? domain).toUpperCase();
}

function getBaseDnFromDomain(domain: string): string {
  const dc = domain.split(".");
  return dc.map(part => `dc=${part}`).join(",");
}

export function getLdapConfigFromEnv(): LdapConfig {
  const SERVER = requireEnv("PGE_DIGITAL_LDAP");
  const USER_ADMIN = requireEnv("PGE_DIGITAL_LDAP_USERNAME");
  const PASS_ADMIN = requireEnv("PGE_DIGITAL_LDAP_PASSWORD");
  const DOMAIN = requireEnv("PGE_DIGITAL_DOMAIN");

  return {
    SERVER,
    USER_ADMIN,
    PASS_ADMIN,
    DOMAIN,
    BASE_DN: getBaseDnFromDomain(DOMAIN),
    PREFIX: getDomainPrefix(DOMAIN),
    ALLOWED_GROUPS: parseGroups(process.env.PGE_DIGITAL_LDAP_GROUPS)
  };
}
