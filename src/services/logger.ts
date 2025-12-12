/**
 * Centralized Logger Service
 *
 * Provides structured logging with configurable log levels and namespaces.
 * Replaces scattered `console.log` with debug environment checks.
 *
 * Usage:
 *   import { logger } from './services/logger.js';
 *   logger.debug('db', 'Query executed', { rows: 5 });
 *   logger.info('Startup complete');
 *   logger.error('Failed to connect', error);
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogNamespace =
    | 'db'
    | 'db-pool'
    | 'uow'
    | 'query'
    | 'app'
    | 'general';

interface LogConfig {
    level: LogLevel;
    enabledNamespaces: Set<LogNamespace>;
}

const LOG_LEVELS: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};

function parseLogLevel(value: string | undefined): LogLevel {
    const level = value?.toLowerCase() as LogLevel | undefined;
    return level && level in LOG_LEVELS ? level : 'info';
}

function parseNamespaces(value: string | undefined): Set<LogNamespace> {
    if (!value || value === '*' || value === 'all') {
        return new Set(['db', 'db-pool', 'uow', 'query', 'app', 'general']);
    }
    return new Set(value.split(',').map((s) => s.trim()) as LogNamespace[]);
}

function getConfig(): LogConfig {
    // Support both new unified env vars and legacy per-feature debug flags
    const level = parseLogLevel(process.env.PGE_DIGITAL_LOG_LEVEL);
    const namespaces = parseNamespaces(process.env.PGE_DIGITAL_LOG_NAMESPACES);

    // Legacy debug env vars still enable their respective namespaces
    if (process.env.PGE_DIGITAL_DB_DEBUG === 'true') {
        namespaces.add('db');
        namespaces.add('db-pool');
    }
    if (process.env.PGE_DIGITAL_UOW_DEBUG === 'true') {
        namespaces.add('uow');
    }
    if (process.env.PGE_DIGITAL_QUERY_DEBUG === 'true') {
        namespaces.add('query');
    }

    return { level, enabledNamespaces: namespaces };
}

const config = getConfig();

function shouldLog(level: LogLevel, namespace?: LogNamespace): boolean {
    const levelCheck = LOG_LEVELS[level] >= LOG_LEVELS[config.level];
    if (!namespace) return levelCheck;
    return levelCheck && config.enabledNamespaces.has(namespace);
}

function formatMessage(
    level: LogLevel,
    namespace: LogNamespace | undefined,
    message: string,
): string {
    const prefix = namespace ? `[${namespace}]` : '';
    return `${prefix} ${message}`.trim();
}

export const logger = {
    /**
     * Debug level logging - only shown when log level is 'debug' and namespace is enabled.
     */
    debug(
        namespaceOrMessage: LogNamespace | string,
        messageOrContext?: string | Record<string, unknown>,
        context?: Record<string, unknown>,
    ): void {
        let ns: LogNamespace | undefined;
        let msg: string;
        let ctx: Record<string, unknown> | undefined;

        if (typeof messageOrContext === 'string') {
            ns = namespaceOrMessage as LogNamespace;
            msg = messageOrContext;
            ctx = context;
        } else {
            ns = undefined;
            msg = namespaceOrMessage;
            ctx = messageOrContext;
        }

        if (!shouldLog('debug', ns)) return;

        if (ctx) {
            console.log(formatMessage('debug', ns, msg), ctx);
        } else {
            console.log(formatMessage('debug', ns, msg));
        }
    },

    /**
     * Info level logging.
     */
    info(message: string, context?: Record<string, unknown>): void {
        if (!shouldLog('info')) return;
        if (context) {
            console.log(formatMessage('info', undefined, message), context);
        } else {
            console.log(formatMessage('info', undefined, message));
        }
    },

    /**
     * Warning level logging.
     */
    warn(message: string, context?: Record<string, unknown>): void {
        if (!shouldLog('warn')) return;
        if (context) {
            console.warn(formatMessage('warn', undefined, message), context);
        } else {
            console.warn(formatMessage('warn', undefined, message));
        }
    },

    /**
     * Error level logging.
     */
    error(message: string, error?: unknown, context?: Record<string, unknown>): void {
        if (!shouldLog('error')) return;
        const logContext = { ...context, error };
        console.error(formatMessage('error', undefined, message), logContext);
    },
};
