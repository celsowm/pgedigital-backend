import type { OrmSession } from 'metal-orm';
import { eq, selectFromEntity, entityRef } from 'metal-orm';
import { ItemAjuda } from '../entities/index.js';
import { findFirst, listEntities, listEntitiesPaged } from './repository-utils.js';

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
  return listEntities(session, buildSelectedQuery, options);
}

export async function listItemAjudaEntitiesPaged(
  session: OrmSession,
  options?: ItemAjudaListOptions,
  paging?: { page: number; pageSize: number },
) {
  return listEntitiesPaged<ItemAjuda, ItemAjudaListOptions>(
    session,
    buildSelectedQuery,
    options,
    paging,
  );
}

export async function findItemAjudaById(
  session: OrmSession,
  id: number,
): Promise<ItemAjuda | null> {
  return findFirst<ItemAjuda>(
    session,
    selectFromEntity(ItemAjuda)
    .select('id', 'identificador', 'html')
    .where(eq(IA.id, id))
  );
}

export async function findItemAjudaByIdentificador(
  session: OrmSession,
  identificador: string,
): Promise<ItemAjuda | null> {
  return findFirst<ItemAjuda>(
    session,
    selectFromEntity(ItemAjuda)
    .select('id', 'identificador', 'html')
    .where(eq(IA.identificador, identificador))
  );
}
