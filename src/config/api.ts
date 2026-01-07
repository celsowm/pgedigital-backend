type ApiConfig = {
  host: string;
  port: number;
  artifactsDir: string;
  enableSwagger: boolean;
  swaggerPath: string;
  swaggerJsonPath: string;
  cors: {
    enabled: boolean;
    origin: string | string[];
    methods?: string[];
    allowedHeaders?: string[];
    credentials?: boolean;
  };
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
  cors: {
    enabled: process.env.CORS_ENABLED === "true",
    origin: process.env.CORS_ORIGIN?.split(",") ?? "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: process.env.CORS_CREDENTIALS === "true",
  },
});
