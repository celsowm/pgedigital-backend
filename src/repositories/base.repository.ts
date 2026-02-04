import {
  entityRef,
  getColumn,
  selectFromEntity,
  type OrmSession,
  type SelectQueryBuilder
} from "metal-orm";

export type FilterOperator = "equals" | "contains";
export type FilterMapping<F extends string> = Record<string, { field: F; operator: FilterOperator }>;

export function createFilterMappings<F extends string>(
  mappings: FilterMapping<F>
): FilterMapping<F> {
  return mappings;
}

type EntityClass<T> = new (...args: unknown[]) => T;
type EntityRef<TEntity extends object> = ReturnType<typeof entityRef<TEntity>>;
type EntityQuery<TEntity extends object> = ReturnType<typeof selectFromEntity<TEntity>>;
type OptionsQuery<TEntity extends object> = EntityQuery<TEntity> extends SelectQueryBuilder<
  infer TResult,
  infer TTable
>
  ? SelectQueryBuilder<TResult & { id: unknown; nome: unknown }, TTable>
  : never;

export interface BaseRepositoryOptions<TEntity, K extends keyof TEntity = keyof TEntity> {
  defaultLabelField?: K;
}

export abstract class BaseRepository<TEntity extends object> {
  abstract readonly entityClass: EntityClass<TEntity>;
  
  private _entityRef?: EntityRef<TEntity>;
  protected readonly defaultLabelField: keyof TEntity;

  constructor(options: BaseRepositoryOptions<TEntity> = {}) {
    this.defaultLabelField = options.defaultLabelField ?? ("nome" as keyof TEntity);
  }

  get entityRef(): EntityRef<TEntity> {
    if (!this._entityRef) {
      this._entityRef = entityRef(this.entityClass as EntityClass<TEntity>);
    }
    return this._entityRef;
  }

  buildListQuery(): EntityQuery<TEntity> {
    return selectFromEntity(this.entityClass as EntityClass<TEntity>);
  }

  buildOptionsQuery(labelField?: keyof TEntity): OptionsQuery<TEntity> {
    const field = labelField ?? this.defaultLabelField;
    const ref = this.entityRef;
    const idColumn = getColumn(ref, "id");
    const labelColumn = getColumn(ref, field as string);
    return selectFromEntity(this.entityClass as EntityClass<TEntity>)
      .select({ id: idColumn, nome: labelColumn })
      .orderBy(labelColumn, "ASC");
  }

  async findById(session: OrmSession, id: number): Promise<TEntity | null> {
    return session.find(this.entityClass as EntityClass<TEntity>, id);
  }
}
