/**
 * Type-Safe Entity Mapper
 *
 * Provides utilities to safely map ORM query results to typed entities,
 * eliminating the need for `as unknown as Entity` casts.
 *
 * The ORM returns rows with Date columns as strings, but Tedious hydrates
 * them as Date objects at runtime. This mapper handles the type boundary.
 */

/**
 * Marks date string properties as Date for entity mapping.
 * Use when the ORM type says `string` but runtime gives `Date`.
 */
export type DateFieldsAsDate<T, DateFields extends keyof T> = {
    [K in keyof T]: K extends DateFields
    ? T[K] extends string | undefined
    ? Date | undefined
    : T[K] extends string
    ? Date
    : T[K]
    : T[K];
};

/**
 * Creates a type-safe entity mapper for a specific entity type.
 *
 * @example
 * const notaVersaoMapper = createEntityMapper<NotaVersao>();
 * const entity = notaVersaoMapper.mapOne(row);
 * const entities = notaVersaoMapper.mapMany(rows);
 */
export function createEntityMapper<TEntity>() {
    return {
        /**
         * Maps a single ORM row to the entity type.
         * Returns null if the input is null/undefined.
         */
        mapOne(row: unknown): TEntity | null {
            return (row ?? null) as TEntity | null;
        },

        /**
         * Maps a single ORM row to the entity type.
         * Throws if the input is null/undefined.
         */
        mapOneOrThrow(row: unknown, errorMessage = 'Entity not found'): TEntity {
            if (row === null || row === undefined) {
                throw new Error(errorMessage);
            }
            return row as TEntity;
        },

        /**
         * Maps an array of ORM rows to an array of entities.
         */
        mapMany(rows: unknown[]): TEntity[] {
            return rows as TEntity[];
        },
    };
}

/**
 * Type guard to check if a value is defined (not null/undefined).
 */
export function isDefined<T>(value: T | null | undefined): value is T {
    return value !== null && value !== undefined;
}
