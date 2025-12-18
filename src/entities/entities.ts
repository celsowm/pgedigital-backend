export * from './entities.generated.js';

export type EntityTables = ReturnType<
  typeof import('./entities.generated.js').bootstrapEntityTables
>;
