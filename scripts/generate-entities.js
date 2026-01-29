#!/usr/bin/env node

const { spawn } = require("child_process");
const path = require("path");

const REQUIRED_ENV_VARS = [
  "PGE_DIGITAL_HOST",
  "PGE_DIGITAL_USER",
  "PGE_DIGITAL_PASSWORD",
  "PGE_DIGITAL_ENCRYPT",
  "PGE_DIGITAL_TRUST_CERT",
  "PGE_DIGITAL_DATABASE"
];

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function parseEnvBoolean(name) {
  const value = requireEnv(name).trim().toLowerCase();
  if (["true", "1", "yes", "y"].includes(value)) {
    return true;
  }
  if (["false", "0", "no", "n"].includes(value)) {
    return false;
  }
  throw new Error(`Invalid boolean for ${name}: ${value}`);
}

function buildConnectionString() {
  const host = requireEnv("PGE_DIGITAL_HOST");
  const userName = requireEnv("PGE_DIGITAL_USER");
  const password = requireEnv("PGE_DIGITAL_PASSWORD");
  const database = requireEnv("PGE_DIGITAL_DATABASE");
  const encrypt = parseEnvBoolean("PGE_DIGITAL_ENCRYPT");
  const trustServerCertificate = parseEnvBoolean("PGE_DIGITAL_TRUST_CERT");

  const url = new URL("mssql://localhost");
  url.username = userName;
  url.password = password;
  url.host = host;
  url.pathname = `/${database}`;
  url.searchParams.set("encrypt", String(encrypt));
  url.searchParams.set("trustServerCertificate", String(trustServerCertificate));

  return url.toString();
}

function buildGeneratorArgs() {
  const url = buildConnectionString();
  const args = [
    path.join(__dirname, "..", "node_modules", "metal-orm", "scripts", "generate-entities.mjs"),
    "--dialect=mssql",
    `--url=${url}`,
    "--out-dir=src/entities",
    "--locale=pt-BR",
    "--naming-overrides=./scripts/naming-overrides.json"
  ];

  const schema = process.env.PGE_DIGITAL_SCHEMA;
  if (schema) {
    args.push(`--schema=${schema}`);
  }

  return args;
}

function run() {
  REQUIRED_ENV_VARS.forEach(requireEnv);
  const args = buildGeneratorArgs();
  const child = spawn(process.execPath, args, { stdio: "inherit" });

  child.on("error", error => {
    console.error("Entity generation failed:", error);
    process.exit(1);
  });

  child.on("exit", code => {
    process.exitCode = code ?? 0;
  });
}

run();
