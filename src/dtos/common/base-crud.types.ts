/**
 * Generic CRUD type aliases for consistent type definitions
 */

export type CreateDto<T, ExcludeKeys extends keyof T = never> = Omit<T, ExcludeKeys | "id">;
export type ReplaceDto<T, ExcludeKeys extends keyof T = never> = Omit<T, ExcludeKeys | "id">;
export type UpdateDto<T, ExcludeKeys extends keyof T = never> = Partial<Omit<T, ExcludeKeys | "id">>;
