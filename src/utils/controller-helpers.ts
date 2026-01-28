import {
  parseFilter,
  parsePagination,
  type RequestContext
} from "adorn-api";
import {
  applyFilter,
  selectFromEntity,
  toPagedResponse,
  type OrmSession
} from "metal-orm";

/**
 * Generic list endpoint handler with pagination and filtering
 */
export async function listWithPagination<TEntity, TQueryDto extends object | undefined>(
  ctx: RequestContext<unknown, TQueryDto>,
  entityClass: any,
  entityRef: any,
  filterMappings: Record<string, { field: keyof TEntity; operator: "equals" | "contains" }>,
  queryBuilder?: (qb: any) => any
): Promise<unknown> {
  const paginationQuery = (ctx.query ?? {}) as Record<string, unknown>;
  const { page, pageSize } = parsePagination(paginationQuery);
  const filters = parseFilter<TEntity, keyof TEntity>(paginationQuery, filterMappings);

  return async (session: OrmSession) => {
    let query = applyFilter(
      selectFromEntity(entityClass).orderBy(entityRef.id, "ASC"),
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
export async function deleteEntity(
  session: OrmSession,
  entityClass: any,
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
export async function listOptions(
  session: OrmSession,
  entityClass: any,
  entityRef: any
): Promise<Array<{ id: number; nome: string }>> {
  const result = await (selectFromEntity(entityClass) as any)
    .select("id", "nome")
    .orderBy(entityRef.nome, "ASC")
    .executePlain(session);
  return result as unknown as Array<{ id: number; nome: string }>;
}

/**
 * Generate filter mappings from DTO filter definitions
 */
export function generateFilterMappings<TFilterFields extends string>(
  filters: Record<string, { schema: any; operator: "equals" | "contains" }>
): Record<string, { field: TFilterFields; operator: "equals" | "contains" }> {
  const mappings: Record<string, { field: TFilterFields; operator: "equals" | "contains" }> = {};
  
  for (const [key, value] of Object.entries(filters)) {
    // Remove "Contains" or "Equals" suffix to get field name
    const fieldName = key.replace(/(Contains|Equals)$/, "") as TFilterFields;
    mappings[key] = { field: fieldName, operator: value.operator };
  }
  
  return mappings;
}
