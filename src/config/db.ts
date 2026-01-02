import { getDbEnv } from "./env.js";

type HostParts = {
  host: string;
  port?: number;
};

const splitHost = (input: string): HostParts => {
  const match = input.match(/^(.+):(\d+)$/);
  if (!match) return { host: input };
  const port = Number(match[2]);
  return Number.isFinite(port) ? { host: match[1], port } : { host: input };
};

type TediousConnectionConfig = {
  server: string;
  authentication: {
    type: "default";
    options: {
      userName: string;
      password: string;
    };
  };
  options: {
    database: string;
    encrypt: boolean;
    trustServerCertificate: boolean;
    port?: number;
  };
};

export const getMssqlConfig = (): TediousConnectionConfig => {
  const env = getDbEnv();
  const { host, port } = splitHost(env.PGE_DIGITAL_HOST);
  const options: TediousConnectionConfig["options"] = {
    database: env.PGE_DIGITAL_DATABASE,
    encrypt: env.PGE_DIGITAL_ENCRYPT,
    trustServerCertificate: env.PGE_DIGITAL_TRUST_CERT,
  };
  if (port) options.port = port;

  return {
    server: host,
    authentication: {
      type: "default",
      options: {
        userName: env.PGE_DIGITAL_USER,
        password: env.PGE_DIGITAL_PASSWORD,
      },
    },
    options,
  };
};

export const buildMssqlUrl = (): string => {
  const env = getDbEnv();
  const { host, port } = splitHost(env.PGE_DIGITAL_HOST);
  const hostWithPort = port ? `${host}:${port}` : host;
  const params = new URLSearchParams({
    encrypt: String(env.PGE_DIGITAL_ENCRYPT),
    trustServerCertificate: String(env.PGE_DIGITAL_TRUST_CERT),
  });

  const user = encodeURIComponent(env.PGE_DIGITAL_USER);
  const pass = encodeURIComponent(env.PGE_DIGITAL_PASSWORD);
  const db = encodeURIComponent(env.PGE_DIGITAL_DATABASE);

  return `mssql://${user}:${pass}@${hostWithPort}/${db}?${params.toString()}`;
};
