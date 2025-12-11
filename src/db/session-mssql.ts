// src/session-mssql.ts
import { Connection, Request, TYPES } from 'tedious';
import {
  SqlServerDialect,
  createTediousExecutor,
} from 'metal-orm';
import { createSessionFactory } from './session-factory.js';

const toMssqlConfig = (connection: string) => {
  const url = new URL(connection);
  return {
    server: url.hostname,
    authentication: {
      type: 'default',
      options: {
        userName: decodeURIComponent(url.username || ''),
        password: decodeURIComponent(url.password || ''),
      },
    },
    options: {
      database: url.pathname.replace(/^\//, ''),
      port: url.port ? Number(url.port) : undefined,
      encrypt: url.searchParams.get('encrypt') === 'true',
      trustServerCertificate: url.searchParams.get('trustServerCertificate') === 'true',
    },
  };
};

const buildDatabaseUrl = () => {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const host = process.env.PGE_DIGITAL_HOST;
  const user = process.env.PGE_DIGITAL_USER;
  const password = process.env.PGE_DIGITAL_PASSWORD;

  if (!host || !user || !password) {
    throw new Error('Database connection details are missing');
  }

  const encrypt = process.env.PGE_DIGITAL_ENCRYPT === 'true' ? 'true' : 'false';
  const trust = process.env.PGE_DIGITAL_TRUST_CERT === 'true' ? 'true' : 'false';
  return `mssql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}/PGE_DIGITAL?encrypt=${encrypt}&trustServerCertificate=${trust}`;
};

export const openSession = createSessionFactory(
  new SqlServerDialect(),
  async () => {
    const connection = new Connection(
      toMssqlConfig(buildDatabaseUrl()),
    );

    await new Promise<void>((resolve, reject) => {
      connection.once('connect', err => (err ? reject(err) : resolve()));
      connection.once('error', reject);
      connection.connect();
    });

    const executor = createTediousExecutor(connection, { Request, TYPES });

    return {
      executor,
      cleanup: () =>
        new Promise<void>((resolve, reject) => {
          connection.once('end', resolve);
          connection.once('error', reject);
          connection.close();
        }),
    };
  },
);
