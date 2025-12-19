import type { OrmSession } from 'metal-orm';

export type LimitOffsetOptions = { limit?: number; offset?: number };
export type PagingOptions = { page: number; pageSize: number };

type ListQueryBuilder = {
  limit: (value: number) => ListQueryBuilder;
  offset: (value: number) => ListQueryBuilder;
  execute: (session: OrmSession) => Promise<unknown[]>;
};

type PagedQueryBuilder = {
  executePaged: (
    session: OrmSession,
    paging: PagingOptions,
  ) => Promise<{ items: unknown[]; totalItems: number }>;
};

type FindQueryBuilder = {
  execute: (session: OrmSession) => Promise<unknown[]>;
};

export async function listEntities<TEntity, TOptions extends LimitOffsetOptions>(
  session: OrmSession,
  buildSelectedQuery: (options?: TOptions) => ListQueryBuilder,
  options?: TOptions,
): Promise<TEntity[]> {
  let builder = buildSelectedQuery(options);

  if (options?.limit !== undefined) {
    builder = builder.limit(options.limit);
  }

  if (options?.offset !== undefined) {
    builder = builder.offset(options.offset);
  }

  const result = await builder.execute(session);
  return result as unknown as TEntity[];
}

export async function listEntitiesPaged<TEntity, TOptions>(
  session: OrmSession,
  buildSelectedQuery: (options?: TOptions) => PagedQueryBuilder,
  options?: TOptions,
  paging?: Partial<PagingOptions>,
): Promise<{ items: TEntity[]; totalItems: number }> {
  const page = paging?.page ?? 1;
  const pageSize = paging?.pageSize ?? 20;

  const { items, totalItems } = await buildSelectedQuery(options).executePaged(session, {
    page,
    pageSize,
  });

  return { items: items as unknown as TEntity[], totalItems };
}

export async function findFirst<TEntity>(
  session: OrmSession,
  builder: FindQueryBuilder,
): Promise<TEntity | null> {
  const [entity] = await builder.execute(session);
  return (entity ?? null) as unknown as TEntity | null;
}

