import { getDecoratorMetadata, getTableDefFromEntity, type OrmSession } from 'metal-orm';
import { buildPaginationMeta, type PaginationQuery } from '../models/pagination.js';
import { normalizePage, normalizePageSize } from '../validators/pagination-validators.js';
import type { PagedResponse } from './service-types.js';

export function assertExists<T>(value: T | null | undefined, error: Error): T {
  if (value === null || value === undefined) {
    throw error;
  }
  return value;
}

export async function getByIdOrThrow<TEntity>(
  session: OrmSession,
  id: number,
  findById: (session: OrmSession, id: number) => Promise<TEntity | null | undefined>,
  notFoundError: () => Error,
): Promise<TEntity> {
  const entity = await findById(session, id);
  if (entity === null || entity === undefined) {
    throw notFoundError();
  }
  return entity;
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
): Promise<PagedResponse<TResponse>> {
  const page = normalizePage(query?.page);
  const pageSize = normalizePageSize(query?.pageSize);

  const { items, totalItems } = await listFn(session, filters, { page, pageSize });

  return {
    items: items.map(map),
    pagination: buildPaginationMeta(page, pageSize, totalItems),
  };
}

export async function commitAndMap<TEntity, TResponse>(
  session: OrmSession,
  entity: TEntity,
  map: (entity: TEntity) => TResponse,
): Promise<TResponse> {
  await session.commit();
  return map(entity);
}

type EntityConstructor<TEntity extends object = object> = new (...args: unknown[]) => TEntity;

function resolvePrimaryKeys(target: object): Set<string> {
  const primaryKeys = new Set<string>();
  const ctor = (target as { constructor?: Function }).constructor;

  if (!ctor) {
    return primaryKeys;
  }

  const decoratorMeta = getDecoratorMetadata(ctor as EntityConstructor<object>) as
    | { columns?: Array<{ propertyName?: string; column?: { primary?: boolean } }> }
    | undefined;
  if (decoratorMeta?.columns) {
    for (const entry of decoratorMeta.columns) {
      if (entry.column?.primary && entry.propertyName) {
        primaryKeys.add(entry.propertyName);
      }
    }
  }

  const table = getTableDefFromEntity(ctor as EntityConstructor<object>);
  if (table?.primaryKey) {
    for (const key of table.primaryKey) {
      primaryKeys.add(key);
    }
  }
  if (table?.columns) {
    for (const [key, column] of Object.entries(table.columns)) {
      if (column.primary) {
        primaryKeys.add(key);
      }
    }
  }

  return primaryKeys;
}

export async function saveGraphAndCommit<TEntity extends object>(
  session: OrmSession,
  entity: EntityConstructor<TEntity>,
  graph: object,
  options: { transactional?: boolean } = { transactional: false },
): Promise<TEntity> {
  const saved = await session.saveGraph(entity as any, graph as any, options as any);
  await session.commit();
  return saved as TEntity;
}

export function applyUpdates<T extends object>(
  target: T,
  updates: Partial<T>,
  keys?: readonly (keyof T)[],
): void {
  const keysToApply = keys ?? (Object.keys(updates) as (keyof T)[]);
  const primaryKeys = resolvePrimaryKeys(target);

  for (const key of keysToApply) {
    const keyName = typeof key === 'string' ? key : typeof key === 'number' ? `${key}` : undefined;
    if (keyName && primaryKeys.has(keyName)) continue;

    const value = updates[key];
    if (value !== undefined) {
      (target as any)[key] = value;
    }
  }
}
