import {
  parseFilter,
  parsePagination,
  type RequestContext
} from "adorn-api";
import {
  applyFilter,
  entityRef,
  selectFromEntity,
  toPagedResponse,
  type OrmSession
} from "metal-orm";

type EntityClass<T> = new (...args: unknown[]) => T;

/**
 * Generic list endpoint handler with pagination and filtering
 */
export async function listWithPagination<TEntity extends object, TQueryDto extends object | undefined>(
  ctx: RequestContext<unknown, TQueryDto>,
  entityClass: EntityClass<TEntity>,
  filterMappings: Record<string, { field: keyof TEntity; operator: "equals" | "contains" }>,
  queryBuilder?: <Q>(qb: Q) => Q
): Promise<unknown> {
  const paginationQuery = (ctx.query ?? {}) as Record<string, unknown>;
  const { page, pageSize } = parsePagination(paginationQuery);
  const filters = parseFilter<TEntity, keyof TEntity>(paginationQuery, filterMappings);
  const ref = entityRef(entityClass);

  return async (session: OrmSession) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const refAny = ref as any;
    let query = applyFilter(
      selectFromEntity(entityClass).orderBy(refAny.id, "ASC"),
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref = entityRef(entityClass) as any;
  const labelRef = ref[optionsLabelField as string];
  const result = await selectFromEntity(entityClass)
    .select({ id: ref.id, nome: labelRef })
    .orderBy(labelRef, "ASC")
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
