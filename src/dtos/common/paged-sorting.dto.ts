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
