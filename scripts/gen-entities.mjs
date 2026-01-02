import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const requireEnv = key => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
};

const parseBoolean = (value, key) => {
  const normalized = value.trim().toLowerCase();
  if (["true", "1", "yes", "y"].includes(normalized)) return true;
  if (["false", "0", "no", "n"].includes(normalized)) return false;
  throw new Error(`Invalid boolean for ${key}: ${value}`);
};

const splitHost = input => {
  const match = input.match(/^(.+):(\d+)$/);
  if (!match) return { host: input };
  const port = Number(match[2]);
  return Number.isFinite(port) ? { host: match[1], port } : { host: input };
};

const buildUrlFromEnv = () => {
  const hostRaw = requireEnv("PGE_DIGITAL_HOST");
  const { host, port } = splitHost(hostRaw);
  const user = encodeURIComponent(requireEnv("PGE_DIGITAL_USER"));
  const pass = encodeURIComponent(requireEnv("PGE_DIGITAL_PASSWORD"));
  const db = encodeURIComponent(requireEnv("PGE_DIGITAL_DATABASE"));
  const encrypt = parseBoolean(requireEnv("PGE_DIGITAL_ENCRYPT"), "PGE_DIGITAL_ENCRYPT");
  const trust = parseBoolean(requireEnv("PGE_DIGITAL_TRUST_CERT"), "PGE_DIGITAL_TRUST_CERT");

  const params = new URLSearchParams({
    encrypt: String(encrypt),
    trustServerCertificate: String(trust),
  });

  const hostWithPort = port ? `${host}:${port}` : host;
  return `mssql://${user}:${pass}@${hostWithPort}/${db}?${params.toString()}`;
};

const schema = process.env.PGE_DIGITAL_SCHEMA ?? "dbo";
const locale = process.env.METAL_ORM_LOCALE ?? process.env.PGE_DIGITAL_LOCALE;
const url = process.env.DATABASE_URL ?? buildUrlFromEnv();

const args = [
  "--dialect=mssql",
  `--schema=${schema}`,
  "--out-dir=src/db/entities",
  `--url=${url}`,
];

if (locale) {
  args.push(`--locale=${locale}`);
}

args.push(...process.argv.slice(2));

const scriptPath = fileURLToPath(
  new URL("../node_modules/metal-orm/scripts/generate-entities.mjs", import.meta.url),
);
const child = spawn(process.execPath, [scriptPath, ...args], { stdio: "inherit" });

child.on("exit", code => {
  process.exit(code ?? 1);
});
