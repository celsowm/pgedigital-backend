import { buildPaginationMeta, type PaginationMeta, type PaginationQuery } from '../models/pagination.js';
import { normalizePage, normalizePageSize } from '../validators/pagination-validators.js';

export function assertExists<T>(value: T | null | undefined, error: Error): T {
  if (value === null || value === undefined) {
    throw error;
  }
  return value;
}

export type PagedListResult<TEntity> = { items: TEntity[]; totalItems: number };

export async function listPaged<TSession, TFilters, TEntity, TResponse>(
  session: TSession,
  listFn: (
    session: TSession,
    filters: TFilters,
    paging: { page: number; pageSize: number },
  ) => Promise<PagedListResult<TEntity>>,
  filters: TFilters,
  query: PaginationQuery | undefined,
  map: (entity: TEntity) => TResponse,
): Promise<{ items: TResponse[]; pagination: PaginationMeta }> {
  const page = normalizePage(query?.page);
  const pageSize = normalizePageSize(query?.pageSize);

  const { items, totalItems } = await listFn(session, filters, { page, pageSize });

  return {
    items: items.map(map),
    pagination: buildPaginationMeta(page, pageSize, totalItems),
  };
}

export function applyUpdates<T extends object, K extends keyof T>(
  target: T,
  updates: Partial<Pick<T, K>>,
  keys: readonly K[],
): void {
  for (const key of keys) {
    const value = updates[key];
    if (value !== undefined) {
      target[key] = value;
    }
  }
}
