import { t, type DtoConstructor } from "adorn-api";
import { registerDto, type FieldMeta } from "adorn-api/dist/core/metadata";
import type { FilterFieldDef } from "adorn-api/dist/adapter/metal-orm/types";
import type { SortingQueryDtoOptions } from "./sorting.dto";

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
