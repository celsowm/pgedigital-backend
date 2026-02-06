import {
  MergeDto,
  createPagedFilterQueryDtoClass,
  t,
  type DtoConstructor,
  type FieldOverride,
  type PagedFilterQueryDtoOptions
} from "adorn-api";
import { SortQueryDto, type SortingQueryDtoOptions } from "./sorting.dto";

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
