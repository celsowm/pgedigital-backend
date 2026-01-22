import { Connection, Request, TYPES } from 'tedious';
import {
  Orm,
  SqlServerDialect,
  createPooledExecutorFactory,
  Pool,
  type PooledConnectionAdapter,
  type DbExecutorFactory,
} from 'metal-orm';

export interface MssqlConfig {
  server: string;
  database: string;
  user: string;
  password: string;
  options: {
    encrypt: boolean;
    trustServerCertificate: boolean;
  };
}

function getConfig(): MssqlConfig {
  return {
    server: process.env.PGE_DIGITAL_HOST!,
    database: process.env.PGE_DIGITAL_DATABASE!,
    user: process.env.PGE_DIGITAL_USER!,
    password: process.env.PGE_DIGITAL_PASSWORD!,
    options: {
      encrypt: process.env.PGE_DIGITAL_ENCRYPT === 'true',
      trustServerCertificate: process.env.PGE_DIGITAL_TRUST_CERT === 'true',
    },
  };
}

function createTediousConnection(config: MssqlConfig): Promise<Connection> {
  return new Promise((resolve, reject) => {
    const connection = new Connection({
      server: config.server,
      authentication: {
        type: 'default',
        options: {
          userName: config.user,
          password: config.password,
        },
      },
      options: {
        database: config.database,
        encrypt: config.options.encrypt,
        trustServerCertificate: config.options.trustServerCertificate,
        port: 1433,
      },
    });

    connection.on('connect', (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(connection);
      }
    });

    connection.connect();
  });
}

const tediousAdapter: PooledConnectionAdapter<Connection> = {
  async query(conn, sql, params = []) {
    return new Promise((resolve, reject) => {
      const rows: Record<string, unknown>[] = [];
      const request = new Request(sql, (err) => {
        if (err) return reject(err);
        resolve(rows);
      });

      params.forEach((value, idx) => {
        const sqlType = inferType(value);
        request.addParameter(`p${idx + 1}`, sqlType, value);
      });

      request.on('row', (columns) => {
        const row: Record<string, unknown> = {};
        for (const col of columns) {
          row[col.metadata.colName] = col.value;
        }
        rows.push(row);
      });

      conn.execSql(request);
    });
  },

  beginTransaction(conn) {
    return new Promise((resolve, reject) => {
      conn.beginTransaction((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  },

  commitTransaction(conn) {
    return new Promise((resolve, reject) => {
      conn.commitTransaction((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  },

  rollbackTransaction(conn) {
    return new Promise((resolve, reject) => {
      conn.rollbackTransaction((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  },
};

function inferType(value: unknown) {
  if (value === null || value === undefined) return TYPES.NVarChar;
  if (typeof value === 'number') {
    return Number.isInteger(value) ? TYPES.Int : TYPES.Float;
  }
  if (typeof value === 'bigint') return TYPES.BigInt;
  if (typeof value === 'boolean') return TYPES.Bit;
  if (value instanceof Date) return TYPES.DateTime;
  if (typeof Buffer !== 'undefined' && Buffer.isBuffer(value)) {
    return TYPES.VarBinary;
  }
  return TYPES.NVarChar;
}

let ormInstance: Orm | null = null;
let executorFactory: DbExecutorFactory | null = null;

export async function createOrm(): Promise<Orm> {
  if (ormInstance) {
    return ormInstance;
  }

  const config = getConfig();

  const pool = new Pool<Connection>(
    {
      async create() {
        return createTediousConnection(config);
      },
      async destroy(conn) {
        conn.close();
      },
      async validate(conn) {
        return conn.state?.name === 'LoggedIn';
      },
    },
    {
      max: 10,
      min: 2,
      idleTimeoutMillis: 30_000,
      acquireTimeoutMillis: 10_000,
    }
  );

  executorFactory = createPooledExecutorFactory({
    pool,
    adapter: tediousAdapter,
  });

  ormInstance = new Orm({
    dialect: new SqlServerDialect(),
    executorFactory,
  });

  return ormInstance;
}

export function getOrm(): Orm {
  if (!ormInstance) {
    throw new Error('ORM not initialized. Call createOrm() first.');
  }
  return ormInstance;
}

export async function disposeOrm(): Promise<void> {
  if (ormInstance) {
    await ormInstance.dispose();
    ormInstance = null;
    executorFactory = null;
  }
}
