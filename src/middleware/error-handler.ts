import type { ErrorRequestHandler } from "express";
import { getLastQuery } from "../db/query-context";

/**
 * Check if an error is a database/SQL error based on common error patterns.
 * This detects errors from tedious (SQL Server driver) and other database drivers.
 */
function isDatabaseError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  // Check for tedious-specific error properties
  const err = error as Error & {
    code?: string | number;
    number?: number;
    sqlState?: string;
  };

  // Tedious/SQL Server error codes
  if (err.code === "EREQUEST" || err.code === "ETIMEOUT" || err.code === "ECONNRESET") {
    return true;
  }

  // SQL Server error number (tedious specific)
  if (typeof err.number === "number" && err.number > 0) {
    return true;
  }

  // SQL state code (SQL standard)
  if (err.sqlState && typeof err.sqlState === "string") {
    return true;
  }

  // Check error message for SQL-related keywords
  const message = err.message.toLowerCase();
  const sqlKeywords = [
    "sql",
    "query",
    "database",
    "table",
    "column",
    "constraint",
    "foreign key",
    "primary key",
    "unique constraint",
    "syntax",
    "invalid object name",
    "the objects",
    "from clause"
  ];

  return sqlKeywords.some(keyword => message.includes(keyword));
}

/**
 * Extract a user-friendly message from a database error.
 */
function getDatabaseErrorMessage(error: Error): string {
  const message = error.message;

  // Return the original message as it usually contains useful SQL Server info
  // But truncate if it's too long
  const maxLength = 500;
  if (message.length > maxLength) {
    return message.substring(0, maxLength) + "...";
  }

  return message;
}

/**
 * Global error handler middleware for Express.
 *
 * This middleware:
 * 1. Catches all errors from the application
 * 2. Detects database/SQL errors
 * 3. Includes the SQL query that caused the error (in development mode)
 * 4. Returns a properly formatted JSON error response
 *
 * Usage:
 *   app.use(errorHandler);
 *
 * Note: This should be registered AFTER all other middleware and routes.
 */
export const errorHandler: ErrorRequestHandler = (
  err,
  _req,
  res,
  _next
): void => {
  // Default status code
  let statusCode = 500;

  // If it's an HTTP error with a status code, use it
  if (err && typeof err === "object" && "statusCode" in err && typeof err.statusCode === "number") {
    statusCode = err.statusCode;
  }

  // Check if this is a database error
  const isDbError = isDatabaseError(err);

  // Build the error response
  const errorResponse: {
    message: string;
    mode: string;
    sql?: string;
    stack?: string;
  } = {
    message: isDbError
      ? getDatabaseErrorMessage(err as Error)
      : (err instanceof Error ? err.message : "An error occurred"),
    mode: process.env.NODE_ENV === "development" ? "development" : "production"
  };

  // Include SQL query in development mode for database errors
  if (isDbError && process.env.NODE_ENV === "development") {
    const lastQuery = getLastQuery();
    if (lastQuery) {
      errorResponse.sql = lastQuery;
    }
  }

  // Include stack trace in development mode
  if (process.env.NODE_ENV === "development" && err instanceof Error && err.stack) {
    errorResponse.stack = err.stack;
  }

  // Send the response
  res.status(statusCode).json(errorResponse);
};

/**
 * Middleware to wrap request handlers in a query context.
 *
 * This must be used BEFORE the error handler and BEFORE any routes that use database operations.
 * It ensures each request has its own isolated query context for tracking SQL queries.
 *
 * Usage:
 *   app.use(queryContextMiddleware);
 *   app.use(routes);
 *   app.use(errorHandler);
 */
export { runWithQueryContext as queryContextMiddleware } from "../db/query-context";
