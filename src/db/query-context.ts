import { AsyncLocalStorage } from "async_hooks";

/**
 * Interface for query context data stored per request
 */
export interface QueryContextData {
  /** The last executed SQL query */
  lastQuery?: string;
  /** All queries executed during the request (for debugging) */
  queries?: string[];
}

/**
 * AsyncLocalStorage instance for maintaining query context across async operations.
 * This allows us to track SQL queries per request without passing context through every function call.
 */
const queryContextStorage = new AsyncLocalStorage<QueryContextData>();

/**
 * Get the current query context from AsyncLocalStorage.
 * Returns undefined if not running within a query context.
 */
export function getQueryContext(): QueryContextData | undefined {
  return queryContextStorage.getStore();
}

/**
 * Run a function within a new query context.
 * This creates an isolated context for tracking SQL queries.
 */
export function runWithQueryContext<T>(fn: () => Promise<T>): Promise<T> {
  return queryContextStorage.run({ queries: [] }, fn);
}

/**
 * Store the last executed SQL query in the current context.
 * This should be called by the query logger to capture each query.
 */
export function setLastQuery(sql: string): void {
  const context = queryContextStorage.getStore();
  if (context) {
    context.lastQuery = sql;
    context.queries?.push(sql);
  }
}

/**
 * Get the last executed SQL query from the current context.
 * Returns undefined if no query has been executed or not in a context.
 */
export function getLastQuery(): string | undefined {
  return queryContextStorage.getStore()?.lastQuery;
}

/**
 * Check if we're currently running within a query context.
 */
export function hasQueryContext(): boolean {
  return queryContextStorage.getStore() !== undefined;
}
