import { NotaVersao, bootstrapEntityTables } from './entities.js';

type EntityTables = ReturnType<typeof bootstrapEntityTables>;

let entityTables: EntityTables | undefined;

export function initEntityTables(): EntityTables {
    entityTables ??= bootstrapEntityTables();
    return entityTables;
}

export function getEntityTables(): EntityTables {
    return initEntityTables();
}

export { NotaVersao };
