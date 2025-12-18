export function assertExists<T>(value: T | null | undefined, error: Error): T {
  if (value === null || value === undefined) {
    throw error;
  }
  return value;
}
