import type { PaginationMeta, PaginationQuery } from '../models/pagination.js';

export type EntityResponse<TEntity> = TEntity;

export type PagedResponse<TItem> = {
  items: TItem[];
  pagination: PaginationMeta;
};

export type ListQuery<TFilters extends object = object> = PaginationQuery & TFilters;

export type CreateInput<
  TEntityJson extends object,
  TRequiredKeys extends keyof TEntityJson,
  TOptionalKeys extends keyof TEntityJson = never,
> = Pick<TEntityJson, TRequiredKeys> & Partial<Pick<TEntityJson, TOptionalKeys>>;

export type UpdateInput<TCreateInput> = Partial<TCreateInput>;
