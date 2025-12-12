/**
 * MSSQL request-scoped session factory.
 *
 * NOTE: This currently opens/closes a physical connection per request.
 * Pooling is planned as a later refactor step.
 */
import { Connection, Request, TYPES } from 'tedious';
import { SqlServerDialect, createTediousExecutor } from 'metal-orm';
import { getDbDebugSummary, getTediousConfig } from '../config/db.js';
import { createSessionFactory } from './session-factory.js';

export const openSession = createSessionFactory(new SqlServerDialect(), async () => {
  const dbDebug = process.env.PGE_DIGITAL_DB_DEBUG === 'true';
  if (dbDebug) {
    // Safe-to-log summary (no plaintext password)
    console.log('[db] debug summary:', getDbDebugSummary());
  }

  const connection = new Connection(getTediousConfig());

  try {
    await new Promise<void>((resolve, reject) => {
      connection.once('connect', (err) => (err ? reject(err) : resolve()));
      connection.once('error', reject);
      connection.connect();
    });
  } catch (err) {
    if (dbDebug) {
      console.error('[db] connect failed with:', {
        summary: getDbDebugSummary(),
        error: err,
      });
    }
    throw err;
  }

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
});
