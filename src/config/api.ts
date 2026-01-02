type ApiConfig = {
  host: string;
  port: number;
  artifactsDir: string;
  enableSwagger: boolean;
  swaggerPath: string;
  swaggerJsonPath: string;
};

const parsePort = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const port = Number(value);
  if (!Number.isFinite(port)) return fallback;
  return port;
};

export const getApiConfig = (): ApiConfig => ({
  host: process.env.HOST ?? "0.0.0.0",
  port: parsePort(process.env.PORT, 3000),
  artifactsDir: ".adorn",
  enableSwagger: true,
  swaggerPath: "/docs",
  swaggerJsonPath: "/docs/openapi.json",
});
