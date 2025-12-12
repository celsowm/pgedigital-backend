/**
 * MSSQL Connection Pool singleton.
 *
 * Provides a shared connection pool for all requests, eliminating the
 * overhead of opening/closing a physical connection per request.
 */
import ConnectionPool from 'tedious-connection-pool2';
import type { Connection } from 'tedious';
import { getTediousConfig, getDbDebugSummary } from '../config/db.js';
import { logger } from '../services/logger.js';

export interface PoolConfig {
    min?: number;
    max?: number;
    idleTimeout?: number;
    retryDelay?: number;
}

const DEFAULT_POOL_CONFIG: PoolConfig = {
    min: 2,
    max: 10,
    idleTimeout: 30000,
    retryDelay: 500,
};

let pool: ConnectionPool | null = null;

function getPoolConfig(): PoolConfig {
    const envMax = process.env.PGE_DIGITAL_POOL_MAX;
    const envMin = process.env.PGE_DIGITAL_POOL_MIN;

    return {
        ...DEFAULT_POOL_CONFIG,
        ...(envMax ? { max: Number(envMax) } : {}),
        ...(envMin ? { min: Number(envMin) } : {}),
    };
}

export function getPool(): ConnectionPool {
    if (!pool) {
        const poolConfig = getPoolConfig();
        const connectionConfig = getTediousConfig();

        logger.debug('db-pool', 'Initializing connection pool', {
            ...poolConfig,
            server: connectionConfig.server,
            database: connectionConfig.options?.database,
        });

        pool = new ConnectionPool(poolConfig, connectionConfig);

        pool.on('error', (err) => {
            logger.error('Pool error', err);
        });
    }

    return pool;
}

/**
 * Acquire a connection from the pool.
 * Returns the connection and a release function.
 */
export function acquireConnection(): Promise<{
    connection: Connection;
    release: () => void;
}> {
    return new Promise((resolve, reject) => {
        getPool().acquire((err, connection) => {
            if (err) {
                logger.debug('db-pool', 'acquire failed', {
                    summary: getDbDebugSummary(),
                    error: err,
                });
                return reject(err);
            }

            resolve({
                connection,
                release: () => {
                    connection.release();
                },
            });
        });
    });
}

/**
 * Drain and close the pool. Use during graceful shutdown.
 */
export function drainPool(): Promise<void> {
    return new Promise((resolve) => {
        if (pool) {
            pool.drain(() => {
                pool = null;
                resolve();
            });
        } else {
            resolve();
        }
    });
}
