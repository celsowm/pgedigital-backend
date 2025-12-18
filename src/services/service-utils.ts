export type JsonifyDates<T> = {
  [K in keyof T]: T[K] extends Date ? string : T[K];
};

type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type SerializeDates<T> = {
  [K in keyof T]: T[K] extends Date ? string : T[K];
};

export type CreateInputFromEntity<
  T,
  OmittedKeys extends keyof T = never,
  OptionalKeys extends Exclude<keyof T, OmittedKeys> = never,
> = MakeOptional<Pick<SerializeDates<T>, Exclude<keyof T, OmittedKeys>>, OptionalKeys>;

export type UpdateInputFromEntity<T, OmittedKeys extends keyof T = never> = Partial<
  Pick<SerializeDates<T>, Exclude<keyof T, OmittedKeys>>
>;

export function assertExists<T>(value: T | null | undefined, error: Error): T {
  if (value === null || value === undefined) {
    throw error;
  }
  return value;
}

export function serializeDates<T extends object>(entity: T): JsonifyDates<T> {
  const record = entity as Record<string, unknown>;
  const result: Record<string, unknown> = {};

  for (const key of Object.keys(record)) {
    const value = record[key];
    result[key] = value instanceof Date ? value.toISOString() : value;
  }

  return result as JsonifyDates<T>;
}
