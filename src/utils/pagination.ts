export type PaginationQuery = {
  page?: number;
  pageSize?: number;
};

export type Pagination = {
  page: number;
  pageSize: number;
};

export type PagedResult<T> = {
  items: T[];
  totalItems: number;
  page: number;
  pageSize: number;
};

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 50;

const toPositiveInt = (value: number | undefined, fallback: number): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }
  const normalized = Math.floor(value);
  return normalized >= 1 ? normalized : fallback;
};

export const resolvePagination = (query?: PaginationQuery): Pagination => ({
  page: toPositiveInt(query?.page, DEFAULT_PAGE),
  pageSize: toPositiveInt(query?.pageSize, DEFAULT_PAGE_SIZE),
});