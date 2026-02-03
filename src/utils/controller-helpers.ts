import {
  parseFilter,
  parsePagination,
  type RequestContext
} from "adorn-api";
import {
  applyFilter,
  entityRef,
  getColumn,
  selectFromEntity,
  toPagedResponse,
  type OrmSession
} from "metal-orm";

type EntityClass<T> = new (...args: unknown[]) => T;
type EntityRef<TEntity extends object> = ReturnType<typeof entityRef<TEntity>>;
type EntityQuery<TEntity extends object> = ReturnType<typeof selectFromEntity<TEntity>>;

/**
 * Generic list endpoint handler with pagination and filtering
 */
export async function listWithPagination<TEntity extends object, TQueryDto extends object | undefined>(
  ctx: RequestContext<unknown, TQueryDto>,
  entityClass: EntityClass<TEntity>,
  filterMappings: Record<string, { field: keyof TEntity; operator: "equals" | "contains" }>,
  queryBuilder?: (qb: EntityQuery<TEntity>) => EntityQuery<TEntity>
): Promise<unknown> {
  const paginationQuery = (ctx.query ?? {}) as Record<string, unknown>;
  const { page, pageSize } = parsePagination(paginationQuery);
  const filters = parseFilter<TEntity, keyof TEntity>(paginationQuery, filterMappings);
  const ref: EntityRef<TEntity> = entityRef(entityClass);
  const idColumn = getColumn(ref, "id");

  return async (session: OrmSession) => {
    let query = applyFilter(
      selectFromEntity(entityClass).orderBy(idColumn, "ASC"),
      entityClass,
      filters
    );

    if (queryBuilder) {
      query = queryBuilder(query);
    }

    const paged = await query.executePaged(session, { page, pageSize });
    return toPagedResponse(paged);
  };
}

/**
 * Generic delete endpoint handler
 */
export async function deleteEntity<TEntity extends object>(
  session: OrmSession,
  entityClass: EntityClass<TEntity>,
  id: number,
  entityName: string
): Promise<void> {
  const entity = await session.find(entityClass, id);
  if (!entity) {
    const { HttpError } = await import("adorn-api");
    throw new HttpError(404, `${entityName} not found.`);
  }
  await session.remove(entity);
  await session.commit();
}

/**
 * Generic options endpoint handler (returns id and name only)
 */
export async function listOptions<TEntity extends object>(
  session: OrmSession,
  entityClass: EntityClass<TEntity>,
  optionsLabelField: keyof TEntity = "nome" as keyof TEntity
): Promise<Array<{ id: number; nome: string }>> {
  const ref: EntityRef<TEntity> = entityRef(entityClass);
  const idColumn = getColumn(ref, "id");
  const labelColumn = getColumn(ref, optionsLabelField as string);
  const result = await selectFromEntity(entityClass)
    .select({ id: idColumn, nome: labelColumn })
    .orderBy(labelColumn, "ASC")
    .executePlain(session);
  return result as unknown as Array<{ id: number; nome: string }>;
}

/**
 * Generate filter mappings from DTO filter definitions
 */
export function generateFilterMappings<TFilterFields extends string>(
  filters: Record<string, { schema: unknown; operator: "equals" | "contains" }>
): Record<string, { field: TFilterFields; operator: "equals" | "contains" }> {
  const mappings: Record<string, { field: TFilterFields; operator: "equals" | "contains" }> = {};
  
  for (const [key, value] of Object.entries(filters)) {
    const fieldName = key.replace(/(Contains|Equals)$/, "") as TFilterFields;
    mappings[key] = { field: fieldName, operator: value.operator };
  }
  
  return mappings;
}
