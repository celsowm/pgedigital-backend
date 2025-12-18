import { BadRequestError } from '../errors/http-error.js';

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/**
 * Normalizes and validates the page parameter.
 * @throws BadRequestError if page is not a positive integer
 */
export function normalizePage(page?: number): number {
  if (page === undefined) {
    return 1;
  }

  if (!Number.isInteger(page) || page <= 0) {
    throw new BadRequestError('page must be a positive integer');
  }

  return page;
}

/**
 * Normalizes and validates the pageSize parameter.
 * @throws BadRequestError if pageSize is invalid
 */
export function normalizePageSize(pageSize?: number): number {
  if (pageSize === undefined) {
    return DEFAULT_PAGE_SIZE;
  }

  if (!Number.isInteger(pageSize) || pageSize <= 0) {
    throw new BadRequestError('pageSize must be a positive integer');
  }

  if (pageSize > MAX_PAGE_SIZE) {
    throw new BadRequestError(`pageSize cannot exceed ${MAX_PAGE_SIZE}`);
  }

  return pageSize;
}

