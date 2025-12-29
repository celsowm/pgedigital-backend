/**
 * Centralized API configuration.
 *
 * Contains all API-related configuration constants that are shared
 * across the application.
 */

/** Base path for all API routes */
export const API_BASE_PATH = '/api';

/** Path to API documentation */
export const API_DOCS_PATH = `${API_BASE_PATH}/docs`;

/** Path to OpenAPI JSON specification */
export const API_OPENAPI_PATH = `${API_BASE_PATH}/openapi.json`;

/** Default server port */
export const DEFAULT_PORT = 3000;

/**
 * Gets the configured server port from environment or default.
 */
export function getServerPort(): number {
    return Number(process.env.PORT ?? DEFAULT_PORT);
}

/**
 * Builds the full server URL for a given port.
 */
export function getServerUrl(port: number = getServerPort()): string {
    return `http://localhost:${port}${API_BASE_PATH}`;
}
