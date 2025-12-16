import { Connection, Request, TYPES } from 'tedious';
import { Pool, SqlServerDialect, createPooledExecutorFactory, createTediousMssqlClient } from 'metal-orm';
import { getTediousConfig, getDbDebugSummary } from '../config/db.js';
import { createSessionFactory } from './session-factory.js';
import { logger } from '../services/logger.js';

const DEFAULT_POOL_SETTINGS = {
    min: 2,
    max: 10,
    idleTimeoutMillis: 30_000,
    acquireTimeoutMillis: 10_000,
};

const poolOptions = createPoolOptions(DEFAULT_POOL_SETTINGS);
const connectionConfig = getTediousConfig();

logger.debug('db-pool', 'Initializing MetalORM connection pool', {
    ...poolOptions,
    server: connectionConfig.server,
    database: connectionConfig.options?.database,
});

const pool = new Pool<Connection>(
    {
        create: createConnection,
        destroy: destroyConnection,
    },
    poolOptions,
);

const moduleBindings = { Request, TYPES } as const;

const executorFactory = createPooledExecutorFactory({
    pool,
    adapter: {
        async query(connection, sql, params) {
            const { recordset } = await createTediousMssqlClient(connection, moduleBindings).query(sql, params);
            return recordset ?? [];
        },
        beginTransaction: async (connection) => {
            const client = createTediousMssqlClient(connection, moduleBindings);
            if (!client.beginTransaction) {
                throw new Error('Tedious client is missing beginTransaction');
            }
            await client.beginTransaction();
        },
        commitTransaction: async (connection) => {
            const client = createTediousMssqlClient(connection, moduleBindings);
            if (!client.commit) {
                throw new Error('Tedious client is missing commit');
            }
            await client.commit();
        },
        rollbackTransaction: async (connection) => {
            const client = createTediousMssqlClient(connection, moduleBindings);
            if (!client.rollback) {
                throw new Error('Tedious client is missing rollback');
            }
            await client.rollback();
        },
    },
});

export const openSession = createSessionFactory(new SqlServerDialect(), async () => {
    const executor = executorFactory.createExecutor();
    return {
        executor,
        cleanup: async () => {
            try {
                await executor.dispose();
            } catch (error) {
                logger.error('db-pool', 'Failed to dispose pooled executor', { error });
            }
        },
    };
});

export const disposeDbPool = () => executorFactory.dispose();

function createPoolOptions(defaults: typeof DEFAULT_POOL_SETTINGS) {
    const envMax = parsePositiveInt(process.env.PGE_DIGITAL_POOL_MAX, defaults.max);
    const envMin = parsePositiveInt(process.env.PGE_DIGITAL_POOL_MIN, defaults.min);
    const max = envMax;
    const min = Math.min(envMin, max);
    const reapIntervalMillis = Math.max(1_000, Math.floor(defaults.idleTimeoutMillis / 2));

    return {
        max,
        min,
        idleTimeoutMillis: defaults.idleTimeoutMillis,
        acquireTimeoutMillis: defaults.acquireTimeoutMillis,
        reapIntervalMillis,
    };
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
    if (!value) return fallback;
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return fallback;
    }
    return Math.floor(parsed);
}

async function createConnection(): Promise<Connection> {
    const connection = new Connection(connectionConfig);
    try {
        await new Promise<void>((resolve, reject) => {
            let onConnect: (error?: Error) => void;
            let onError: (error: Error) => void;

            const cleanup = () => {
                connection.removeListener('connect', onConnect);
                connection.removeListener('error', onError);
            };

            onConnect = (error?: Error) => {
                cleanup();
                if (error) {
                    return reject(error);
                }
                resolve();
            };

            onError = (error: Error) => {
                cleanup();
                reject(error);
            };

            connection.once('connect', onConnect);
            connection.once('error', onError);
            connection.connect();
        });
        return connection;
    } catch (error) {
        logger.error('db-pool', 'Failed to initialize MSSQL connection', {
            summary: getDbDebugSummary(),
            error,
        });
        try {
            await new Promise<void>((resolve) => {
                connection.once('end', resolve);
                connection.close();
            });
        } catch {
            // ignore cleanup errors
        }
        throw error;
    }
}

async function destroyConnection(connection: Connection): Promise<void> {
    await new Promise<void>((resolve, reject) => {
        let onEnd: () => void;
        let onError: (error: Error) => void;

        const cleanup = () => {
            connection.removeListener('end', onEnd);
            connection.removeListener('error', onError);
        };

        onEnd = () => {
            cleanup();
            resolve();
        };

        onError = (error: Error) => {
            cleanup();
            reject(error);
        };

        connection.once('end', onEnd);
        connection.once('error', onError);
        connection.close();
    });
}
