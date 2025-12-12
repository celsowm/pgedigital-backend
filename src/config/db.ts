import type { ConnectionConfig } from 'tedious';

export type SqlServerEnvConfig = {
    DATABASE_URL?: string;
    PGE_DIGITAL_HOST?: string;
    PGE_DIGITAL_USER?: string;
    PGE_DIGITAL_PASSWORD?: string;
    PGE_DIGITAL_ENCRYPT?: string;
    PGE_DIGITAL_TRUST_CERT?: string;
    PGE_DIGITAL_DATABASE?: string;
};

/**
 * `process.env` is a string index signature type, so we accept any record-like env
 * and only read the keys we care about.
 */
export type EnvLike = Record<string, string | undefined>;

const defaultDatabaseName = 'PGE_DIGITAL';

export function getDatabaseUrl(env: EnvLike = process.env): string {
    if (env.DATABASE_URL) {
        return env.DATABASE_URL;
    }

    const host = env.PGE_DIGITAL_HOST;
    const user = env.PGE_DIGITAL_USER;
    const password = env.PGE_DIGITAL_PASSWORD;
    const database = env.PGE_DIGITAL_DATABASE ?? defaultDatabaseName;

    if (!host || !user || !password) {
        throw new Error('Database connection details are missing (PGE_DIGITAL_HOST/USER/PASSWORD or DATABASE_URL)');
    }

    const encrypt = env.PGE_DIGITAL_ENCRYPT === 'true' ? 'true' : 'false';
    const trustServerCertificate = env.PGE_DIGITAL_TRUST_CERT === 'true' ? 'true' : 'false';

    return `mssql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}/${encodeURIComponent(database)}?encrypt=${encrypt}&trustServerCertificate=${trustServerCertificate}`;
}

export function toTediousConfig(connectionUrl: string): ConnectionConfig {
    const url = new URL(connectionUrl);

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
            database: decodeURIComponent(url.pathname.replace(/^\//, '')),
            port: url.port ? Number(url.port) : undefined,
            encrypt: url.searchParams.get('encrypt') === 'true',
            trustServerCertificate: url.searchParams.get('trustServerCertificate') === 'true',
        },
    };
}

export function getTediousConfig(env: EnvLike = process.env): ConnectionConfig {
    return toTediousConfig(getDatabaseUrl(env));
}

export type DbDebugSummary = {
    source: 'DATABASE_URL' | 'PGE_DIGITAL_*';
    url: string;
    server?: string;
    port?: number;
    database?: string;
    userName?: string;
    password?: string;
    encrypt?: boolean;
    trustServerCertificate?: boolean;
};

/**
 * Safe-to-log DB summary (no plaintext password).
 * Intended for diagnosing auth/host parsing issues.
 */
export function getDbDebugSummary(env: EnvLike = process.env): DbDebugSummary {
    const source: DbDebugSummary['source'] = env.DATABASE_URL ? 'DATABASE_URL' : 'PGE_DIGITAL_*';
    const url = getDatabaseUrl(env);
    const cfg = toTediousConfig(url);
    const authOptions = (cfg.authentication as any)?.options ?? {};

    return {
        source,
        url,
        server: cfg.server,
        port: cfg.options?.port,
        database: cfg.options?.database,
        userName: authOptions.userName,
        password: typeof authOptions.password === 'string' ? authOptions.password : undefined,
        encrypt: cfg.options?.encrypt,
        trustServerCertificate: cfg.options?.trustServerCertificate,
    };
}
