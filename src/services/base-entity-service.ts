import type { OrmSession } from 'metal-orm';
import { applyUpdates, commitAndMap, getByIdOrThrow, listPaged, saveGraphAndCommit } from './service-utils.js';
import type { EntityResponse, PagedResponse, ListQuery } from './service-types.js';
import { NotFoundError } from '../errors/http-error.js';
import type { PagedListResult } from './service-utils.js';

export interface IEntityRepository<TEntity, TFilters = Record<string, unknown>> {
  listPaged: (session: OrmSession, filters: TFilters, paging: { page: number; pageSize: number }) => Promise<PagedListResult<TEntity>>;
  findById: (session: OrmSession, id: number) => Promise<TEntity | null>;
}

export interface IEntityValidators<
  TCreateInput,
  TUpdateInput,
  TCreateValidated,
  TUpdateValidated,
> {
  validateCreate: (input: TCreateInput) => TCreateValidated;
  validateUpdate: (input: TUpdateInput) => TUpdateValidated;
}

export class BaseEntityService<
  TEntity extends object,
  TCreateInput extends object,
  TUpdateInput extends object,
  TListQuery extends ListQuery,
  TFilters,
  TCreateValidated extends object = TCreateInput,
  TUpdateValidated extends object = TUpdateInput,
> {
  protected readonly entityName: string;
  protected readonly toResponse: (entity: TEntity) => EntityResponse<TEntity>;
  private readonly getBaseFiltersFn: (query?: TListQuery) => TFilters;
  private readonly beforeCreateFn?: (session: OrmSession, validated: TCreateValidated) => Promise<void>;
  private readonly beforeUpdateFn?: (
    session: OrmSession,
    entity: TEntity,
    validated: TUpdateValidated,
  ) => Promise<void>;
  private readonly repository: IEntityRepository<TEntity, TFilters>;
  private readonly validators: IEntityValidators<
    TCreateInput,
    TUpdateInput,
    TCreateValidated,
    TUpdateValidated
  >;
  private readonly entityClass: new (...args: any[]) => TEntity;
  private readonly softDeleteFn?: (entity: TEntity) => void;
  private readonly updateFields?: readonly (keyof TEntity)[];

  constructor(options: {
    entityName: string;
    repository: IEntityRepository<TEntity, TFilters>;
    validators: IEntityValidators<TCreateInput, TUpdateInput, TCreateValidated, TUpdateValidated>;
    entityClass: new (...args: any[]) => TEntity;
    softDeleteFn?: (entity: TEntity) => void;
    updateFields?: readonly (keyof TEntity)[];
    getBaseFilters?: (query?: TListQuery) => TFilters;
    beforeCreate?: (session: OrmSession, validated: TCreateValidated) => Promise<void>;
    beforeUpdate?: (
      session: OrmSession,
      entity: TEntity,
      validated: TUpdateValidated,
    ) => Promise<void>;
    toResponse?: (entity: TEntity) => EntityResponse<TEntity>;
  }) {
    this.entityName = options.entityName;
    this.toResponse = options.toResponse ?? ((entity: TEntity) => entity as EntityResponse<TEntity>);
    this.repository = options.repository;
    this.validators = options.validators;
    this.entityClass = options.entityClass;
    this.softDeleteFn = options.softDeleteFn;
    this.updateFields = options.updateFields;
    this.getBaseFiltersFn = options.getBaseFilters ?? (() => ({} as TFilters));
    this.beforeCreateFn = options.beforeCreate;
    this.beforeUpdateFn = options.beforeUpdate;
  }

  async list(session: OrmSession, query?: TListQuery): Promise<PagedResponse<EntityResponse<TEntity>>> {
    const filters = this.getBaseFilters(query);
    return listPaged(session, this.repository.listPaged, filters, query, this.toResponse);
  }

  protected getBaseFilters(_query?: TListQuery): TFilters {
    return this.getBaseFiltersFn(_query);
  }

  async get(session: OrmSession, id: number): Promise<EntityResponse<TEntity>> {
    const entity = await getByIdOrThrow(session, id, this.repository.findById, () => new NotFoundError(`${this.entityName} ${id} not found`));
    return this.toResponse(entity);
  }

  async create(session: OrmSession, input: TCreateInput): Promise<EntityResponse<TEntity>> {
    const validated = this.validators.validateCreate(input);
    await this.beforeCreate(session, validated);
    const entity = await saveGraphAndCommit(session, this.entityClass, validated);
    return this.toResponse(entity);
  }

  protected async beforeCreate(_session: OrmSession, _validated: TCreateValidated): Promise<void> {
    if (this.beforeCreateFn) {
      await this.beforeCreateFn(_session, _validated);
    }
  }

  async update(session: OrmSession, id: number, input: TUpdateInput): Promise<EntityResponse<TEntity>> {
    const entity = await getByIdOrThrow(session, id, this.repository.findById, () => new NotFoundError(`${this.entityName} ${id} not found`));
    const validated = this.validators.validateUpdate(input);
    await this.beforeUpdate(session, entity, validated);
    applyUpdates(entity, validated as Partial<TEntity>, this.updateFields);
    return commitAndMap(session, entity, this.toResponse);
  }

  protected async beforeUpdate(
    _session: OrmSession,
    _entity: TEntity,
    _validated: TUpdateValidated,
  ): Promise<void> {
    if (this.beforeUpdateFn) {
      await this.beforeUpdateFn(_session, _entity, _validated);
    }
  }

  async delete(session: OrmSession, id: number): Promise<void> {
    const entity = await getByIdOrThrow(session, id, this.repository.findById, () => new NotFoundError(`${this.entityName} ${id} not found`));
    if (this.softDeleteFn) {
      this.softDeleteFn(entity);
      await session.commit();
    } else {
      await session.remove(entity);
      await session.commit();
    }
  }
}
