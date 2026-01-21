import {
  Orm,
  OrmSession,
  SqlServerDialect,
  Pool,
  PoolAdapter,
  PooledConnectionAdapter,
  createPooledExecutorFactory,
  type DbExecutorFactory,
} from 'metal-orm';

interface TediousRequest {
  addParameter(name: string, type: unknown, value: unknown): void;
  on(event: 'row', listener: (columns: unknown[]) => void): void;
}

interface TediousRequestCtor {
  new (sql: string, callback: (err?: Error | null) => void): TediousRequest;
}

interface TediousColumn {
  metadata: {
    colName: string;
  };
  value: unknown;
}

interface TediousTypes {
  NVarChar: unknown;
  Int: unknown;
  Float: unknown;
  BigInt: unknown;
  Bit: unknown;
  DateTime: unknown;
  VarBinary: unknown;
}

interface TediousConnectionLike {
  execSql(request: unknown): void;
  beginTransaction?(cb: (err?: Error | null) => void): void;
  commitTransaction?(cb: (err?: Error | null) => void): void;
  rollbackTransaction?(cb: (err?: Error | null) => void): void;
  on(event: string, listener: (...args: any[]) => void): void;
  connect(callback: (err?: Error) => void): void;
  close(): void;
  closed: boolean;
}

const tediousModule = {
  Request: require('tedious').Request as TediousRequestCtor,
  TYPES: require('tedious').TYPES as TediousTypes,
  Connection: require('tedious').Connection as any,
};

const tediousConfig = {
  server: process.env.PGE_DIGITAL_HOST || 'localhost',
  authentication: {
    type: 'default',
    options: {
      userName: process.env.PGE_DIGITAL_USER || 'sa',
      password: process.env.PGE_DIGITAL_PASSWORD || '',
    },
  },
  options: {
    encrypt: true,
    trustServerCertificate: true,
    database: process.env.PGE_DIGITAL_DATABASE || 'pgedigital',
    port: 1433,
    requestTimeout: 30000,
    rowCollectionOnRequestCompletion: true,
    useColumnNames: false,
    instanceName: '',
  },
};

const poolOptions = {
  max: 20,
  min: 2,
  idleTimeoutMillis: 30000,
  acquireTimeoutMillis: 5000,
  reapIntervalMillis: 15000,
  evictionRunIntervalMillis: 10000,
};

class TediousPoolAdapter implements PoolAdapter<TediousConnectionLike> {
  async create(): Promise<TediousConnectionLike> {
    return new Promise<TediousConnectionLike>((resolve, reject) => {
      const connection = new tediousModule.Connection(tediousConfig);
      connection.on('connect', (err: Error | undefined) => {
        if (err) {
          reject(err);
        } else {
          resolve(connection);
        }
      });
      connection.on('error', (err: Error) => {
        reject(err);
      });
    });
  }

  async destroy(connection: TediousConnectionLike): Promise<void> {
    return new Promise<void>((resolve) => {
      connection.on('end', () => {
        resolve();
      });
      connection.close();
    });
  }

  async validate(connection: TediousConnectionLike): Promise<boolean> {
    return connection && !connection.closed;
  }
}

const pooledConnectionAdapter: PooledConnectionAdapter<TediousConnectionLike> = {
  async query(conn: TediousConnectionLike, sql: string, params?: unknown[]): Promise<Array<Record<string, unknown>>> {
    const { Request } = tediousModule;
    const rows: Record<string, unknown>[] = [];

    return new Promise((resolve, reject) => {
      const request = new Request(sql, (err?: Error | null) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });

      request.on('row', (columns: unknown[]) => {
        const row: Record<string, unknown> = {};
        (columns as TediousColumn[]).forEach((column: TediousColumn) => {
          row[column.metadata.colName] = column.value;
        });
        rows.push(row);
      });

      if (params && params.length > 0) {
        params.forEach((param, index) => {
          const paramName = `param${index}`;
          request.addParameter(paramName, inferType(param), param);
        });
      }

      conn.execSql(request);
    });
  },

  async beginTransaction(conn: TediousConnectionLike): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      conn.beginTransaction?.((err?: Error | null) => {
        if (err) reject(err);
        else resolve();
      }) ?? resolve();
    });
  },

  async commitTransaction(conn: TediousConnectionLike): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      conn.commitTransaction?.((err?: Error | null) => {
        if (err) reject(err);
        else resolve();
      }) ?? resolve();
    });
  },

  async rollbackTransaction(conn: TediousConnectionLike): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      conn.rollbackTransaction?.((err?: Error | null) => {
        if (err) reject(err);
        else resolve();
      }) ?? resolve();
    });
  },
};

function inferType(value: unknown): unknown {
  if (value === null || value === undefined) {
    return tediousModule.TYPES.NVarChar;
  }
  if (typeof value === 'string') {
    return tediousModule.TYPES.NVarChar;
  }
  if (typeof value === 'number') {
    return Number.isInteger(value) ? tediousModule.TYPES.Int : tediousModule.TYPES.Float;
  }
  if (typeof value === 'boolean') {
    return tediousModule.TYPES.Bit;
  }
  if (value instanceof Date) {
    return tediousModule.TYPES.DateTime;
  }
  return tediousModule.TYPES.NVarChar;
}

const pool = new Pool<TediousConnectionLike>(
  new TediousPoolAdapter(),
  poolOptions
);

const executorFactory: DbExecutorFactory = createPooledExecutorFactory<TediousConnectionLike>({
  pool,
  adapter: pooledConnectionAdapter,
});

export const orm = new Orm({
  dialect: new SqlServerDialect(),
  executorFactory,
});

export async function createSession(): Promise<OrmSession> {
  const executor = executorFactory.createExecutor();
  return new OrmSession({ orm, executor });
}

export async function withSession<T>(handler: (session: OrmSession) => Promise<T>): Promise<T> {
  const session = await createSession();
  try {
    return await handler(session);
  } finally {
    await session.dispose();
  }
}

export async function initializeDatabase(): Promise<void> {
  console.log(`Connecting to database: ${tediousConfig.options.database}@${tediousConfig.server}`);
  try {
    const lease = await Promise.race([
      pool.acquire(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Connection timeout after 5s')), 5000)
      ),
    ]);
    await lease.release();
    console.log('Database connection successful');
  } catch (error) {
    if (error instanceof Error) {
      console.warn(`Database connection failed: ${error.message}`);
      console.warn('Continuing without database - API endpoints that require database will fail');
    }
  }
}

export async function closeDatabase(): Promise<void> {
  await pool.destroy();
}
