import type { OrmSession } from 'metal-orm';
import { eq, isNull, selectFromEntity, entityRef } from 'metal-orm';
import { NotaVersao } from '../entities/index.js';

const NV = entityRef(NotaVersao);

export interface NotaVersaoListOptions {
  sprint?: number;
  ativo?: boolean;
  /** Include `ativo = false` rows (still excludes soft-deleted rows unless `includeDeleted` is true). */
  includeInactive?: boolean;
  /** Include soft-deleted rows (where `data_exclusao` is not null). */
  includeDeleted?: boolean;
  limit?: number;
  offset?: number;
}

const buildFilteredQuery = (options?: NotaVersaoListOptions) => {
  let builder = selectFromEntity(NotaVersao);

  if (options?.sprint !== undefined) {
    builder = builder.where(eq(NV.sprint, options.sprint));
  }

  if (options?.ativo !== undefined) {
    builder = builder.where(eq(NV.ativo, options.ativo));
  } else if (!options?.includeInactive) {
    // Default behavior: only active records
    builder = builder.where(eq(NV.ativo, true));
  }

  if (!options?.includeDeleted) {
    builder = builder.where(isNull(NV.data_exclusao));
  }

  return builder;
};

const buildSelectedQuery = (options?: NotaVersaoListOptions) =>
  buildFilteredQuery(options)
    .select('id', 'data', 'sprint', 'ativo', 'mensagem', 'data_exclusao', 'data_inativacao')
    .orderBy(NV.data, 'DESC');

export async function listNotaVersaoEntities(
  session: OrmSession,
  options?: NotaVersaoListOptions,
): Promise<NotaVersao[]> {
  let builder = buildSelectedQuery(options);

  if (options?.limit !== undefined) {
    builder = builder.limit(options.limit);
  }

  if (options?.offset !== undefined) {
    builder = builder.offset(options.offset);
  }

  const result = await builder.execute(session);
  return result as unknown as NotaVersao[];
}

export async function listNotaVersaoEntitiesPaged(
  session: OrmSession,
  options?: NotaVersaoListOptions,
  paging?: { page: number; pageSize: number },
) {
  const page = paging?.page ?? 1;
  const pageSize = paging?.pageSize ?? 20;

  const { items, totalItems } = await buildSelectedQuery(options).executePaged(session, {
    page,
    pageSize,
  });

  return { items: items as unknown as NotaVersao[], totalItems };
}

export async function findNotaVersaoById(
  session: OrmSession,
  id: number,
): Promise<NotaVersao | null> {
  const [entity] = await selectFromEntity(NotaVersao)
    .select('id', 'data', 'sprint', 'ativo', 'mensagem', 'data_exclusao', 'data_inativacao')
    .where(eq(NV.id, id))
    .execute(session);
  return (entity ?? null) as unknown as NotaVersao | null;
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
