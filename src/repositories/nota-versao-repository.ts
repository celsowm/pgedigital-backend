import type { OrmSession } from 'metal-orm';
import { eq, isNull } from 'metal-orm';
import { NotaVersao } from '../entities/index.js';
import { createEntityRepository } from './entity-repository.js';
import type { LimitOffsetOptions } from './repository-utils.js';

export interface NotaVersaoListFilters {
  sprint?: number;
  ativo?: boolean;
  /** Include `ativo = false` rows (still excludes soft-deleted rows unless `includeDeleted` is true). */
  includeInactive?: boolean;
  /** Include soft-deleted rows (where `data_exclusao` is not null). */
  includeDeleted?: boolean;
}

export interface NotaVersaoListOptions extends NotaVersaoListFilters, LimitOffsetOptions {
}

const repository = createEntityRepository<NotaVersao, NotaVersaoListFilters>({
  entity: NotaVersao,
  select: ['id', 'data', 'sprint', 'ativo', 'mensagem', 'data_exclusao', 'data_inativacao'],
  orderBy: (ref) => [{ column: ref.data, direction: 'DESC' }],
  applyFilters: (builder, ref, filters) => {
    let query = builder;

    if (filters.sprint !== undefined) {
      query = query.where(eq(ref.sprint, filters.sprint));
    }

    if (filters.ativo !== undefined) {
      query = query.where(eq(ref.ativo, filters.ativo));
    } else if (!filters.includeInactive) {
      // Default behavior: only active records
      query = query.where(eq(ref.ativo, true));
    }

    if (!filters.includeDeleted) {
      query = query.where(isNull(ref.data_exclusao));
    }

    return query;
  },
});

export async function listNotaVersaoEntities(
  session: OrmSession,
  options?: NotaVersaoListOptions,
): Promise<NotaVersao[]> {
  return repository.list(session, options ?? ({} as NotaVersaoListOptions));
}

export async function listNotaVersaoEntitiesPaged(
  session: OrmSession,
  options?: NotaVersaoListFilters,
  paging?: { page: number; pageSize: number },
) {
  return repository.listPaged(session, options ?? ({} as NotaVersaoListFilters), paging);
}

export async function findNotaVersaoById(
  session: OrmSession,
  id: number,
): Promise<NotaVersao | null> {
  return repository.findById(session, id);
}

/**
 * Deactivates a NotaVersao entity (sets ativo = false).
 * The entity must be a tracked entity from findNotaVersaoById.
 */
export function deactivateNotaVersaoEntity(entity: NotaVersao): void {
  if (entity.ativo) {
    entity.ativo = false;
    entity.data_inativacao = new Date();
  }
}

/**
 * Soft-deletes a NotaVersao entity.
 * Sets ativo = false and records deletion timestamp.
 * The entity must be a tracked entity from findNotaVersaoById.
 */
export function softDeleteNotaVersaoEntity(entity: NotaVersao): void {
  const now = new Date();
  entity.ativo = false;
  entity.data_exclusao = now;
  entity.data_inativacao ??= now;
}

/**
 * Activates a NotaVersao entity.
 * Sets ativo = true and clears inativacao timestamp.
 */
export function activateNotaVersaoEntity(entity: NotaVersao): void {
  if (entity.data_exclusao) {
    throw new Error('Cannot activate a soft-deleted entity');
  }
  entity.ativo = true;
  entity.data_inativacao = undefined;
}

/**
 * Batch deactivate all active NotaVersao entities for a given sprint.
 * Used when activating a new version to ensure only one active per sprint.
 */
export async function deactivateOtherVersionsForSprint(
  session: OrmSession,
  sprint: number,
  excludeId?: number,
): Promise<void> {
  const activeForSprint = await listNotaVersaoEntities(session, {
    sprint,
    ativo: true,
    includeDeleted: true,
  });

  for (const entity of activeForSprint) {
    if (excludeId === undefined || entity.id !== excludeId) {
      deactivateNotaVersaoEntity(entity);
    }
  }
}
