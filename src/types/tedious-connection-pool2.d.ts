declare module 'tedious-connection-pool2' {
    import { Connection, ConnectionConfig } from 'tedious';

    interface PoolConfig {
        min?: number;
        max?: number;
        idleTimeout?: number;
        retryDelay?: number;
    }

    interface PooledConnection extends Connection {
        release: () => void;
    }

    type AcquireCallback = (err: Error | null, connection: PooledConnection) => void;
    type DrainCallback = () => void;

    class ConnectionPool {
        constructor(poolConfig: PoolConfig, connectionConfig: ConnectionConfig);
        acquire(callback: AcquireCallback): void;
        drain(callback: DrainCallback): void;
        on(event: 'error', listener: (err: Error) => void): this;
    }

    export = ConnectionPool;
}
