import { createTediousExecutor, Orm, OrmSession, SqlServerDialect, type QueryResult } from "metal-orm";
import { Connection, type ConnectionConfig, Request, TYPES } from "tedious";

const REQUIRED_ENV_VARS = [
  "PGE_DIGITAL_HOST",
  "PGE_DIGITAL_USER",
  "PGE_DIGITAL_PASSWORD",
  "PGE_DIGITAL_ENCRYPT",
  "PGE_DIGITAL_TRUST_CERT",
  "PGE_DIGITAL_DATABASE"
] as const;

type RequiredEnv = typeof REQUIRED_ENV_VARS[number];

let orm: Orm | null = null;

function getOrm(): Orm {
  if (!orm) {
    orm = new Orm({
      dialect: new SqlServerDialect(),
      executorFactory: {
        createExecutor: () => {
          throw new Error("Use withMssqlSession to create sessions.");
        },
        createTransactionalExecutor: () => {
          throw new Error("Use withMssqlSession to create sessions.");
        },
        dispose: async () => {}
      }
    });
  }
  return orm;
}

function requireEnv(name: RequiredEnv): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function parseEnvBoolean(name: RequiredEnv): boolean {
  const value = requireEnv(name).trim().toLowerCase();
  if (["true", "1", "yes", "y"].includes(value)) {
    return true;
  }
  if (["false", "0", "no", "n"].includes(value)) {
    return false;
  }
  throw new Error(`Invalid boolean for ${name}: ${value}`);
}

export function getMssqlConfigFromEnv(): ConnectionConfig {
  const server = requireEnv("PGE_DIGITAL_HOST");
  const userName = requireEnv("PGE_DIGITAL_USER");
  const password = requireEnv("PGE_DIGITAL_PASSWORD");
  const database = requireEnv("PGE_DIGITAL_DATABASE");
  const encrypt = parseEnvBoolean("PGE_DIGITAL_ENCRYPT");
  const trustServerCertificate = parseEnvBoolean("PGE_DIGITAL_TRUST_CERT");

  return {
    server,
    authentication: {
      type: "default",
      options: {
        userName,
        password
      }
    },
    options: {
      database,
      encrypt,
      trustServerCertificate
    }
  };
}

export async function createTediousConnection(): Promise<Connection> {
  const connection = new Connection(getMssqlConfigFromEnv());
  await connectTedious(connection);
  return connection;
}

export function createMssqlExecutor(connection: Connection) {
  return createTediousExecutor(connection, { Request, TYPES });
}

export async function withMssqlSession<T>(
  handler: (session: OrmSession) => Promise<T>
): Promise<T> {
  const connection = await createTediousConnection();
  const executor = createMssqlExecutor(connection);
  const session = new OrmSession({ orm: getOrm(), executor });

  try {
    return await handler(session);
  } finally {
    try {
      await session.dispose();
    } finally {
      connection.close();
    }
  }
}

export async function testMssqlConnection(): Promise<{
  ok: boolean;
  databaseName?: string;
}> {
  const connection = await createTediousConnection();
  const executor = createMssqlExecutor(connection);

  try {
    const [result] = await executor.executeSql(
      "SELECT DB_NAME() AS databaseName"
    );
    const row = firstRowToObject(result);
    return {
      ok: true,
      databaseName: typeof row.databaseName === "string" ? row.databaseName : undefined
    };
  } finally {
    connection.close();
  }
}

async function connectTedious(connection: Connection): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    let settled = false;
    const onError = (err: Error) => finalize(err);

    const finalize = (err?: Error) => {
      if (settled) return;
      settled = true;
      connection.removeListener("error", onError);
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    };

    connection.connect(err => finalize(err));
    connection.once("error", onError);
  });
}

function firstRowToObject(result: QueryResult): Record<string, unknown> {
  if (!result.columns.length || !result.values.length) {
    return {};
  }

  const row = result.values[0];
  const record: Record<string, unknown> = {};
  result.columns.forEach((column, index) => {
    record[column] = row[index];
  });
  return record;
}
