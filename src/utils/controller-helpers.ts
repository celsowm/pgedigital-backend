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
  type OrmSession,
  type ColumnDef,
  type WhereInput
} from "metal-orm";
import type { FilterMapping } from "../repositories/base.repository";

type EntityClass<T> = new (...args: unknown[]) => T;
type EntityRef<TEntity extends object> = ReturnType<typeof entityRef<TEntity>>;
type EntityQuery<TEntity extends object> = ReturnType<typeof selectFromEntity<TEntity>>;
type SortDirection = "ASC" | "DESC";

export interface ParsedSorting {
  sortBy: string | null;
  sortOrder: SortDirection;
}

export interface SortingConfig {
  defaultSortBy?: string;
  defaultSortOrder?: SortDirection;
  allowedColumns?: string[];
}

/**
 * Parses sorting parameters from query parameters.
 * @param query - Query parameters
 * @param config - Sorting configuration
 * @returns Parsed sorting result
 */
export function parseSorting(
  query: Record<string, unknown>,
  config: SortingConfig = {}
): ParsedSorting {
  const { defaultSortBy = null, defaultSortOrder = "ASC", allowedColumns } = config;

  const rawSortBy = typeof query.sortBy === "string" ? query.sortBy.trim() : null;
  let sortBy = rawSortBy ? rawSortBy : defaultSortBy;
  
  if (sortBy && allowedColumns && !allowedColumns.includes(sortBy)) {
    sortBy = defaultSortBy;
  }

  const rawOrder = typeof query.sortOrder === "string" ? query.sortOrder.trim().toUpperCase() : null;
  const sortOrder: SortDirection = rawOrder === "DESC" ? "DESC" : (rawOrder === "ASC" ? "ASC" : defaultSortOrder);

  return { sortBy, sortOrder };
}

export interface ListWithPaginationOptions<TEntity extends object> {
  filterMappings: FilterMapping;
  sortableColumns?: (keyof TEntity & string)[];
  defaultSortBy?: keyof TEntity & string;
  defaultSortOrder?: SortDirection;
  queryBuilder?: (qb: EntityQuery<TEntity>) => EntityQuery<TEntity>;
}

/**
 * Generic list endpoint handler with pagination, filtering, and sorting
 */
export function listWithPagination<TEntity extends object, TQueryDto extends object | undefined>(
  ctx: RequestContext<unknown, TQueryDto>,
  entityClass: EntityClass<TEntity>,
  options: ListWithPaginationOptions<TEntity>
): (session: OrmSession) => Promise<unknown>;

/**
 * @deprecated Use the options object overload instead
 */
export function listWithPagination<TEntity extends object, TQueryDto extends object | undefined>(
  ctx: RequestContext<unknown, TQueryDto>,
  entityClass: EntityClass<TEntity>,
  filterMappings: FilterMapping,
  queryBuilder?: (qb: EntityQuery<TEntity>) => EntityQuery<TEntity>
): (session: OrmSession) => Promise<unknown>;

export function listWithPagination<TEntity extends object, TQueryDto extends object | undefined>(
  ctx: RequestContext<unknown, TQueryDto>,
  entityClass: EntityClass<TEntity>,
  filterMappingsOrOptions: FilterMapping | ListWithPaginationOptions<TEntity>,
  queryBuilder?: (qb: EntityQuery<TEntity>) => EntityQuery<TEntity>
): (session: OrmSession) => Promise<unknown> {
  const isOptionsObject = (obj: unknown): obj is ListWithPaginationOptions<TEntity> =>
    typeof obj === "object" && obj !== null && "filterMappings" in obj;

  const options: ListWithPaginationOptions<TEntity> = isOptionsObject(filterMappingsOrOptions)
    ? filterMappingsOrOptions
    : { filterMappings: filterMappingsOrOptions, queryBuilder };

  const paginationQuery = (ctx.query ?? {}) as Record<string, unknown>;
  const { page, pageSize } = parsePagination(paginationQuery);
  const filters = parseFilter(paginationQuery, options.filterMappings);
  
  const { sortBy, sortOrder } = parseSorting(paginationQuery, {
    defaultSortBy: options.defaultSortBy ?? "id",
    defaultSortOrder: options.defaultSortOrder ?? "ASC",
    allowedColumns: options.sortableColumns
  });

  const ref: EntityRef<TEntity> = entityRef(entityClass);

  return async (session: OrmSession) => {
    let query = applyFilter(
      selectFromEntity(entityClass),
      entityClass,
      filters as WhereInput<typeof entityClass>
    );

    if (options.queryBuilder) {
      query = options.queryBuilder(query);
    }

    if (sortBy) {
      const sortColumn = getColumn(ref, sortBy) as ColumnDef;
      query = query.orderBy(sortColumn, sortOrder);
      if (sortBy !== "id") {
        const idColumn = getColumn(ref, "id") as ColumnDef;
        query = query.orderBy(idColumn, "ASC");
      }
    } else {
      const idColumn = getColumn(ref, "id") as ColumnDef;
      query = query.orderBy(idColumn, "ASC");
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
