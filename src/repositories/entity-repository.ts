import { entityRef, eq, selectFromEntity } from 'metal-orm';
import type { OrmSession } from 'metal-orm';
import { findFirst, listEntities, listEntitiesPaged, type LimitOffsetOptions } from './repository-utils.js';

type EntityCtor<TEntity extends object> = new (...args: unknown[]) => TEntity;
type EntityRef<TEntity extends object> = ReturnType<typeof entityRef<TEntity>>;

export type EntityRepositoryConfig<TEntity extends object, TFilters> = {
  entity: EntityCtor<TEntity>;
  select?: readonly (keyof TEntity | string)[];
  include?: readonly string[];
  orderBy?: (ref: EntityRef<TEntity>) => Array<{ column: unknown; direction?: 'ASC' | 'DESC' }>;
  applyFilters?: (builder: any, ref: EntityRef<TEntity>, filters: TFilters) => any;
  idField?: keyof TEntity & string;
};

export type EntityRepository<TEntity extends object, TFilters> = {
  list: (
    session: OrmSession,
    options?: TFilters & LimitOffsetOptions,
  ) => Promise<TEntity[]>;
  listPaged: (
    session: OrmSession,
    filters: TFilters,
    paging?: { page: number; pageSize: number },
  ) => Promise<{ items: TEntity[]; totalItems: number }>;
  findById: (session: OrmSession, id: number) => Promise<TEntity | null>;
  buildQuery: (filters?: TFilters) => any;
  ref: EntityRef<TEntity>;
};

export function createEntityRepository<TEntity extends object, TFilters>(
  config: EntityRepositoryConfig<TEntity, TFilters>,
): EntityRepository<TEntity, TFilters> {
  const ref = entityRef(config.entity);
  const idField = config.idField ?? 'id';

  const buildQuery = (filters?: TFilters) => {
    let builder = selectFromEntity(config.entity);

    if (config.applyFilters && filters !== undefined) {
      builder = config.applyFilters(builder, ref, filters);
    }

    if (config.select && config.select.length > 0) {
      builder = builder.select(...config.select);
    }

    if (config.include && config.include.length > 0) {
      for (const relation of config.include) {
        builder = builder.include(relation);
      }
    }

    if (config.orderBy) {
      for (const { column, direction } of config.orderBy(ref)) {
        builder = builder.orderBy(column as any, direction ?? 'ASC');
      }
    }

    return builder;
  };

  const list = (session: OrmSession, options?: TFilters & LimitOffsetOptions) =>
    listEntities<TEntity, TFilters & LimitOffsetOptions>(
      session,
      buildQuery as (options?: TFilters & LimitOffsetOptions) => any,
      options,
    );

  const listPaged = (
    session: OrmSession,
    filters: TFilters,
    paging?: { page: number; pageSize: number },
  ) =>
    listEntitiesPaged<TEntity, TFilters>(
      session,
      buildQuery as (options?: TFilters) => any,
      filters,
      paging,
    );

  const findById = (session: OrmSession, id: number) =>
    findFirst<TEntity>(
      session,
      buildQuery().where(eq((ref as any)[idField], id)),
    );

  return {
    list,
    listPaged,
    findById,
    buildQuery,
    ref,
  };
}
