import {
  Dto,
  Field,
  MergeDto,
  createPagedFilterQueryDtoClass,
  t,
  type DtoConstructor,
  type FieldOverride,
  type PagedFilterQueryDtoOptions
} from "adorn-api";
import { registerDto, type FieldMeta } from "adorn-api/dist/core/metadata";
import type { FilterFieldDef } from "adorn-api/dist/adapter/metal-orm/types";

export type SortOrder = "ASC" | "DESC" | "asc" | "desc";

@Dto({ name: "SortQueryDto", description: "Ordering parameters." })
export class SortQueryDto {
  @Field(t.optional(t.string({ minLength: 1 })))
  sortBy?: string;

  @Field(t.optional(t.enum(["ASC", "DESC", "asc", "desc"])))
  sortOrder?: SortOrder;
}

export interface SortingQueryParams {
  sortBy?: string;
  sortOrder?: SortOrder;
}

export interface SortingQueryDtoOptions {
  sortableColumns?: readonly string[];
  sortOrderValues?: readonly SortOrder[];
}

export function createPagedFilterSortingQueryDtoClass(
  options: PagedFilterQueryDtoOptions & SortingQueryDtoOptions
): DtoConstructor {
  const { name, sortableColumns, sortOrderValues, ...rest } = options;
  const baseName = name ? `${name}Base` : undefined;
  const baseQueryDto = createPagedFilterQueryDtoClass({
    ...rest,
    name: baseName
  });

  const overrides: Record<string, FieldOverride> = {};
  if (sortableColumns && sortableColumns.length > 0) {
    overrides.sortBy = { schema: t.enum([...sortableColumns]), optional: true };
  }
  if (sortOrderValues && sortOrderValues.length > 0) {
    overrides.sortOrder = { schema: t.enum([...sortOrderValues]), optional: true };
  }

  @MergeDto([baseQueryDto, SortQueryDto], {
    name: name ?? "PagedFilterSortingQueryDto",
    description: "Paged filter query with sorting.",
    overrides: Object.keys(overrides).length ? overrides : undefined
  })
  class PagedFilterSortingQueryDto {}

  return PagedFilterSortingQueryDto;
}

export interface FilterOnlyQueryDtoOptions extends SortingQueryDtoOptions {
  name?: string;
  filters: Record<string, FilterFieldDef>;
}

export function createFilterOnlySortingQueryDtoClass(
  options: FilterOnlyQueryDtoOptions
): DtoConstructor {
  const { name, filters, sortableColumns, sortOrderValues } = options;

  const FilterOnlyQueryDto = class {
    [key: string]: any;
  };

  const fields: Record<string, FieldMeta> = {};

  for (const [fieldName, def] of Object.entries(filters)) {
    const schema = def.schema ?? t.string({ minLength: 1 });
    fields[fieldName] = { schema: t.optional(schema), optional: true };
  }

  const sortBySchema = sortableColumns && sortableColumns.length > 0
    ? t.enum([...sortableColumns])
    : t.string({ minLength: 1 });
  fields.sortBy = { schema: t.optional(sortBySchema), optional: true };

  const sortOrderSchema = sortOrderValues && sortOrderValues.length > 0
    ? t.enum([...sortOrderValues])
    : t.enum(["ASC", "DESC", "asc", "desc"]);
  fields.sortOrder = { schema: t.optional(sortOrderSchema), optional: true };

  registerDto(FilterOnlyQueryDto, {
    name: name ?? "FilterOnlyQueryDto",
    fields
  });

  return FilterOnlyQueryDto as DtoConstructor;
}
