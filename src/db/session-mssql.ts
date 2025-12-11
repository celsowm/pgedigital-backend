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
    },
  };
};

export const openSession = createSessionFactory(
  new SqlServerDialect(),
  async () => {
    const connection = new Connection(
      toMssqlConfig(process.env.DATABASE_URL!),
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