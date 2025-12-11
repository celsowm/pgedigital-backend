// src/session-factory.ts
import { Orm, OrmSession } from 'metal-orm';
import type { DbExecutor } from 'metal-orm';

type Connector = () => Promise<{ executor: DbExecutor; cleanup: () => Promise<void> }>;

export const createSessionFactory = (dialect: any, connect: Connector) => {
  const orm = new Orm({
    dialect,
    executorFactory: {
      createExecutor() {
        throw new Error('Use the request-scoped connector instead of the default factory.');
      },
      createTransactionalExecutor() {
        throw new Error('Use the request-scoped connector instead of the default factory.');
      },
    },
  });

  return async () => {
    const { executor, cleanup } = await connect();
    const session = new OrmSession({ orm, executor });
    return { session, cleanup };
  };
};