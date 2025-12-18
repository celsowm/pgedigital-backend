import { bootstrapEntityTables } from './entities.js';
import type { EntityTables } from './entities.js';
import { applyEntityHooks } from './hooks/index.js';

let entityTables: EntityTables | undefined;

export function initEntityTables(): EntityTables {
    if (!entityTables) {
        entityTables = bootstrapEntityTables();
        applyEntityHooks(entityTables);
    }
    return entityTables;
}

export function getEntityTables(): EntityTables {
    return initEntityTables();
}

export * from './entities.js';
