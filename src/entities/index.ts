import { NotaVersao, bootstrapEntityTables } from './entities.js';
import { getTableDefFromEntity } from 'metal-orm';

type EntityTables = ReturnType<typeof bootstrapEntityTables>;

let entityTables: EntityTables | undefined;

export function initEntityTables(): EntityTables {
    if (!entityTables) {
        entityTables = bootstrapEntityTables();
        setupEntityHooks();
    }
    return entityTables;
}

export function getEntityTables(): EntityTables {
    return initEntityTables();
}

/**
 * Setup lifecycle hooks for entities.
 * This is done after bootstrapping to keep entities.ts pristine for regeneration.
 */
function setupEntityHooks(): void {
    const notaVersaoTable = getTableDefFromEntity(NotaVersao);
    if (!notaVersaoTable) {
        throw new Error('NotaVersao table not found after bootstrap');
    }

    notaVersaoTable.hooks = {
        beforeInsert(_ctx: any, entity: any) {
            // Set default value for ativo if not provided
            if (entity.ativo === undefined) {
                entity.ativo = true;
            }
        },

        beforeRemove(_ctx: any, entity: any) {
            // Prevent hard deletes - always use soft delete
            if (!entity.data_exclusao) {
                const now = new Date();
                entity.ativo = false;
                entity.data_exclusao = now;
                entity.data_inativacao ??= now;
            }
            // Return false to prevent actual deletion
            return false;
        },
    } as any;
}

export { NotaVersao };
