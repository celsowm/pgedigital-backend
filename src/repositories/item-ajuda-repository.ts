import type { OrmSession } from 'metal-orm';
import { eq, selectFromEntity, entityRef } from 'metal-orm';
import { ItemAjuda } from '../entities/index.js';

const IA = entityRef(ItemAjuda);

export interface ItemAjudaListOptions {
  identificador?: string;
  limit?: number;
  offset?: number;
}

const buildFilteredQuery = (options?: ItemAjudaListOptions) => {
  let builder = selectFromEntity(ItemAjuda);

  if (options?.identificador !== undefined) {
    builder = builder.where(eq(IA.identificador, options.identificador));
  }

  return builder;
};

const buildSelectedQuery = (options?: ItemAjudaListOptions) =>
  buildFilteredQuery(options).select('id', 'identificador', 'html').orderBy(IA.identificador, 'ASC');

export async function listItemAjudaEntities(
  session: OrmSession,
  options?: ItemAjudaListOptions,
): Promise<ItemAjuda[]> {
  let builder = buildSelectedQuery(options);

  if (options?.limit !== undefined) {
    builder = builder.limit(options.limit);
  }

  if (options?.offset !== undefined) {
    builder = builder.offset(options.offset);
  }

  const result = await builder.execute(session);
  return result as unknown as ItemAjuda[];
}

export async function listItemAjudaEntitiesPaged(
  session: OrmSession,
  options?: ItemAjudaListOptions,
  paging?: { page: number; pageSize: number },
) {
  const page = paging?.page ?? 1;
  const pageSize = paging?.pageSize ?? 20;

  const { items, totalItems } = await buildSelectedQuery(options).executePaged(session, {
    page,
    pageSize,
  });

  return { items: items as unknown as ItemAjuda[], totalItems };
}

export async function findItemAjudaById(
  session: OrmSession,
  id: number,
): Promise<ItemAjuda | null> {
  const [entity] = await selectFromEntity(ItemAjuda)
    .select('id', 'identificador', 'html')
    .where(eq(IA.id, id))
    .execute(session);
  return (entity ?? null) as unknown as ItemAjuda | null;
}

export async function findItemAjudaByIdentificador(
  session: OrmSession,
  identificador: string,
): Promise<ItemAjuda | null> {
  const [entity] = await selectFromEntity(ItemAjuda)
    .select('id', 'identificador', 'html')
    .where(eq(IA.identificador, identificador))
    .execute(session);
  return (entity ?? null) as unknown as ItemAjuda | null;
}

