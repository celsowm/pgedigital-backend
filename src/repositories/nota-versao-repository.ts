import {
  OrmSession,
  createEntityFromRow,
  esel,
  eq,
  isNull,
  count,
  selectFromEntity,
} from 'metal-orm';
import { NotaVersao, getNotaVersaoTable } from '../entities/index.js';
import { createEntityMapper } from '../db/entity-mapper.js';

const notaVersaoTable = getNotaVersaoTable();
const notaVersaoMapper = createEntityMapper<NotaVersao>();

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

export interface NotaVersaoCreatePayload {
  data: Date;
  sprint: number;
  mensagem: string;
  ativo: boolean;
}

export interface NotaVersaoUpdatePayload {
  data?: Date;
  sprint?: number;
  mensagem?: string;
  ativo?: boolean;
}

const buildFilteredQuery = (options?: NotaVersaoListOptions) => {
  // Type note:
  // Metal-ORM's `EntityInstance<TTable>` infers DATE/DATETIME columns as `string`.
  // With Tedious (MSSQL), these values are typically hydrated as `Date` at runtime.
  // We use the entity mapper to handle the type boundary cleanly.
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
  return notaVersaoMapper.mapMany(rows);
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
  return notaVersaoMapper.mapOne(entity);
}

export function createNotaVersaoRecord(
  session: OrmSession,
  payload: NotaVersaoCreatePayload,
): NotaVersao {
  const entity = createEntityFromRow(session, notaVersaoTable, payload);
  return notaVersaoMapper.mapOneOrThrow(entity, 'Failed to create NotaVersao');
}

/**
 * Updates a NotaVersao entity with the provided changes.
 * The entity must be a tracked entity from findNotaVersaoById.
 */
export function updateNotaVersaoEntity(
  entity: NotaVersao,
  changes: NotaVersaoUpdatePayload,
): void {
  if (changes.data !== undefined) {
    entity.data = changes.data;
  }
  if (changes.sprint !== undefined) {
    entity.sprint = changes.sprint;
  }
  if (changes.mensagem !== undefined) {
    entity.mensagem = changes.mensagem;
  }
  if (changes.ativo !== undefined) {
    entity.ativo = changes.ativo;
  }
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
