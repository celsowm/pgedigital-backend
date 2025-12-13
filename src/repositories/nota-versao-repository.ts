import type { OrmSession } from 'metal-orm';
import { esel, eq, isNull, count, selectFromEntity } from 'metal-orm';
import { NotaVersao, getNotaVersaoTable } from '../entities/index.js';

const notaVersaoTable = getNotaVersaoTable();

export interface NotaVersaoGraphPayload {
  id?: number;
  data: Date;
  sprint: number;
  mensagem: string;
  ativo: boolean;
  data_exclusao?: Date;
  data_inativacao?: Date;
}

interface SaveGraphConfig {
  transactional?: boolean;
  pruneMissing?: boolean;
}

const DEFAULT_SAVE_GRAPH_OPTIONS: SaveGraphConfig = { transactional: false };

export async function persistNotaVersaoGraph(
  session: OrmSession,
  payload: NotaVersaoGraphPayload,
  options?: SaveGraphConfig,
): Promise<NotaVersao> {
  const mergedOptions: SaveGraphConfig = { ...DEFAULT_SAVE_GRAPH_OPTIONS, ...(options ?? {}) };
  return session.saveGraph(NotaVersao, payload, mergedOptions);
}

const getSelection = () =>
  esel(
    NotaVersao,
    'id',
    'data',
    'sprint',
    'ativo',
    'mensagem',
    'data_exclusao',
    'data_inativacao',
  );

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
  let builder = selectFromEntity<typeof notaVersaoTable>(NotaVersao);

  if (options?.sprint !== undefined) {
    builder = builder.where(eq(notaVersaoTable.columns.sprint, options.sprint));
  }

  if (options?.ativo !== undefined) {
    builder = builder.where(eq(notaVersaoTable.columns.ativo, options.ativo));
  } else if (!options?.includeInactive) {
    // Default behavior: only active records
    builder = builder.where(eq(notaVersaoTable.columns.ativo, true));
  }

  if (!options?.includeDeleted) {
    builder = builder.where(isNull(notaVersaoTable.columns.data_exclusao));
  }

  return builder;
};

export async function listNotaVersaoEntities(
  session: OrmSession,
  options?: NotaVersaoListOptions,
): Promise<NotaVersao[]> {
  let builder = buildFilteredQuery(options)
    .select(getSelection())
    .orderBy(notaVersaoTable.columns.data, 'DESC');

  if (options?.limit !== undefined) {
    builder = builder.limit(options.limit);
  }

  if (options?.offset !== undefined) {
    builder = builder.offset(options.offset);
  }

  const rows = await builder.execute(session);
  return rows as unknown as NotaVersao[];
}

export async function countNotaVersaoEntities(
  session: OrmSession,
  options?: NotaVersaoListOptions,
) {
  const [row] = await buildFilteredQuery(options)
    .select({ total: count(notaVersaoTable.columns.id) })
    .execute(session);

  return Number(row?.total ?? 0);
}

export async function findNotaVersaoById(
  session: OrmSession,
  id: number,
): Promise<NotaVersao | null> {
  const [entity] = await selectFromEntity<typeof notaVersaoTable>(NotaVersao)
    .select(getSelection())
    .where(eq(notaVersaoTable.columns.id, id))
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
