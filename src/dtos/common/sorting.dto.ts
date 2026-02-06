import { Dto, Field, t } from "adorn-api";

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
