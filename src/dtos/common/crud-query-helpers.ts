import type { FilterFieldDef } from "adorn-api/dist/adapter/metal-orm/types";
import { createPagedResponseDtoClass, t, type DtoConstructor } from "adorn-api";
import { createPagedFilterSortingQueryDtoClass } from "./paged-filter-sorting.dto";
import { createFilterOnlySortingQueryDtoClass } from "./filter-only-sorting.dto";
import { createOptionsArraySchema, createOptionDto } from "./base-option.dto";
import type { SortingQueryParams } from "./sorting.dto";

/**
 * Filter and sortable configuration for CRUD query DTOs
 */
export interface CrudQueryConfig {
  name: string;
  sortableColumns: string[];
  filters: Record<string, FilterFieldDef>;
}

/**
 * Creates both paged query DTO class and filter-only options DTO class
 * from a single configuration to eliminate duplication.
 */
export function createCrudQueryDtoPair(config: CrudQueryConfig) {
  const { name, sortableColumns, filters } = config;

  const paged = createPagedFilterSortingQueryDtoClass({
    name: `${name}QueryDto`,
    sortableColumns,
    filters
  });

  const options = createFilterOnlySortingQueryDtoClass({
    name: `${name}OptionsQueryDto`,
    sortableColumns,
    filters
  });

  return { paged, options };
}

/**
 * Creates the standard paged response DTO for an entity.
 */
export function createCrudPagedResponseDto<T extends DtoConstructor>(
  name: string,
  itemDto: T,
  entityName: string
) {
  return createPagedResponseDtoClass({
    name: `${name}PagedResponseDto`,
    itemDto,
    description: `Paged ${entityName} list response.`
  });
}

/**
 * Common filter field definitions that can be reused across entities.
 */
export const CommonFilters = {
  nomeContains: { schema: t.string({ minLength: 1 }), operator: "contains" as const },
  ativo: { schema: t.integer(), operator: "equals" as const },
  id: { schema: t.integer(), operator: "equals" as const }
};

/**
 * Extracts query interface type from filter configuration.
 * This generates the interface automatically from the filters,
 * eliminating the need to manually define matching interfaces.
 */
export type QueryInterfaceFromFilters<
  TFilters extends Record<string, FilterFieldDef>,
  TExtra extends Record<string, unknown> = {}
> = SortingQueryParams & {
  [K in keyof TFilters]?: TFilters[K]["schema"] extends { type: "string" }
    ? string
    : TFilters[K]["schema"] extends { type: "number" } | { type: "integer" }
    ? number
    : unknown;
} & TExtra;

/**
 * Helper to build filter configuration with type safety.
 */
export function buildFilters<T extends Record<string, FilterFieldDef>>(
  filters: T
): T {
  return filters;
}
