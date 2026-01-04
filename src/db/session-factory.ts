import { Orm, OrmSession, type DbExecutorFactory, type DbExecutor } from "metal-orm";

type Connector = () => Promise<{ executor: DbExecutor; cleanup: () => Promise<void> }>;

const missingExecutor = (): never => {
  throw new Error("Use the request-scoped connector instead of the default factory.");
};

type OrmOptions = ConstructorParameters<typeof Orm>[0];
type OrmDialect = OrmOptions["dialect"];

export const createSessionFactory = (dialect: OrmDialect, connect: Connector) => {
  const orm = new Orm({
    dialect,
    executorFactory: {
      createExecutor: () => missingExecutor(),
      createTransactionalExecutor: () => missingExecutor(),
      dispose: async () => undefined,
    } satisfies DbExecutorFactory,
  });

  orm.interceptors.use(async (ctx, next) => {
    const start = Date.now();
    try {
      const results = await next();
      const duration = Date.now() - start;
      console.log(`[SQL] ${ctx.sql}`);
      console.log(`[Params] ${JSON.stringify(ctx.params)}`);
      console.log(`[Duration] ${duration}ms`);
      return results;
    } catch (error) {
      console.error(`[SQL Error] ${ctx.sql}`, error);
      throw error;
    }
  });

  return async () => {
    const { executor, cleanup } = await connect();
    const session = new OrmSession({ orm, executor });
    return { session, cleanup };
  };
};
