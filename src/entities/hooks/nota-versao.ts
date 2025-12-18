import type { TableHooks } from 'metal-orm';
import type { EntityTables } from '../entities.js';

export function applyNotaVersaoHooks(tables: EntityTables): void {
  const notaVersaoTable = tables.NotaVersao;

  const beforeInsert = notaVersaoTable.hooks?.beforeInsert;
  const beforeDelete = notaVersaoTable.hooks?.beforeDelete;

  const hooks: TableHooks = {
    ...notaVersaoTable.hooks,

    async beforeInsert(ctx, entity) {
      await beforeInsert?.(ctx, entity);
      const nv = entity as { ativo?: boolean };
      if (nv.ativo === undefined) {
        nv.ativo = true;
      }
    },

    async beforeDelete(ctx, entity) {
      await beforeDelete?.(ctx, entity);
      throw new Error(
        'Hard delete is disabled for NotaVersao; use soft delete (set data_exclusao) instead.',
      );
    },
  };

  notaVersaoTable.hooks = hooks;
}

