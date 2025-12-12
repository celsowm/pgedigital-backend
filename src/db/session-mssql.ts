/**
 * MSSQL request-scoped session factory.
 *
 * Uses connection pooling for better performance under load.
 */
import { Request, TYPES } from 'tedious';
import { SqlServerDialect, createTediousExecutor } from 'metal-orm';
import { acquireConnection } from './connection-pool.js';
import { createSessionFactory } from './session-factory.js';

export const openSession = createSessionFactory(new SqlServerDialect(), async () => {
  const { connection, release } = await acquireConnection();

  const executor = createTediousExecutor(connection, { Request, TYPES });

  return {
    executor,
    cleanup: async () => {
      // Release connection back to pool instead of closing it
      release();
    },
  };
});
