import type { OrmSession } from 'metal-orm';
import { eq } from 'metal-orm';
import { ItemAjuda } from '../entities/index.js';
import { createEntityRepository } from './entity-repository.js';
import { findFirst } from './repository-utils.js';

export interface ItemAjudaListFilters {
  identificador?: string;
}

export interface ItemAjudaListOptions extends ItemAjudaListFilters {
  limit?: number;
  offset?: number;
}

const repository = createEntityRepository<ItemAjuda, ItemAjudaListFilters>({
  entity: ItemAjuda,
  select: ['id', 'identificador', 'html'],
  orderBy: (ref) => [{ column: ref.identificador, direction: 'ASC' }],
  applyFilters: (builder, ref, filters) => {
    let query = builder;

    if (filters.identificador !== undefined) {
      query = query.where(eq(ref.identificador, filters.identificador));
    }

    return query;
  },
});

export async function listItemAjudaEntities(
  session: OrmSession,
  options?: ItemAjudaListOptions,
): Promise<ItemAjuda[]> {
  return repository.list(session, options ?? ({} as ItemAjudaListOptions));
}

export async function listItemAjudaEntitiesPaged(
  session: OrmSession,
  options?: ItemAjudaListFilters,
  paging?: { page: number; pageSize: number },
) {
  return repository.listPaged(session, options ?? ({} as ItemAjudaListFilters), paging);
}

export async function findItemAjudaById(
  session: OrmSession,
  id: number,
): Promise<ItemAjuda | null> {
  return repository.findById(session, id);
}

export async function findItemAjudaByIdentificador(
  session: OrmSession,
  identificador: string,
): Promise<ItemAjuda | null> {
  return findFirst<ItemAjuda>(
    session,
    repository.buildQuery({ identificador }),
  );
}
