import type { EntityTables } from '../entities.js';
import { applyNotaVersaoHooks } from './nota-versao.js';

export function applyEntityHooks(tables: EntityTables): void {
  applyNotaVersaoHooks(tables);
}

