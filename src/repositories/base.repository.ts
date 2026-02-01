import { entityRef, selectFromEntity, type OrmSession } from "metal-orm";

export type FilterOperator = "equals" | "contains";
export type FilterMapping<F extends string> = Record<string, { field: F; operator: FilterOperator }>;

export function createFilterMappings<F extends string>(
  mappings: FilterMapping<F>
): FilterMapping<F> {
  return mappings;
}

type EntityClass<T> = new (...args: unknown[]) => T;

export interface BaseRepositoryOptions<TEntity, K extends keyof TEntity = keyof TEntity> {
  defaultLabelField?: K;
}

export abstract class BaseRepository<TEntity> {
  abstract readonly entityClass: EntityClass<TEntity>;
  
  private _entityRef?: ReturnType<typeof entityRef<TEntity & object>>;
  protected readonly defaultLabelField: keyof TEntity;

  constructor(options: BaseRepositoryOptions<TEntity> = {}) {
    this.defaultLabelField = options.defaultLabelField ?? ("nome" as keyof TEntity);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get entityRef(): any {
    if (!this._entityRef) {
      this._entityRef = entityRef(this.entityClass as EntityClass<TEntity & object>);
    }
    return this._entityRef;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  buildListQuery(): any {
    const ref = this.entityRef;
    return selectFromEntity(this.entityClass as EntityClass<TEntity & object>).orderBy(ref.id, "ASC");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  buildOptionsQuery(labelField?: keyof TEntity): any {
    const field = labelField ?? this.defaultLabelField;
    const ref = this.entityRef;
    return selectFromEntity(this.entityClass as EntityClass<TEntity & object>)
      .select({ id: ref.id, nome: ref[field as string] })
      .orderBy(ref[field as string], "ASC");
  }

  async findById(session: OrmSession, id: number): Promise<TEntity | null> {
    return session.find(this.entityClass as EntityClass<TEntity & object>, id);
  }
}
