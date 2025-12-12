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

const notaVersaoTable = getNotaVersaoTable();

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

const buildFilteredQuery = (options?: NotaVersaoListOptions) => {
  // Type note:
  // Metal-ORM's `EntityInstance<TTable>` infers DATE/DATETIME columns as `string`.
  // With Tedious (MSSQL), these values are typically hydrated as `Date` at runtime.
  // We keep the domain entity type (`NotaVersao`) and isolate casting at the repository boundary.
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

export function createNotaVersaoRecord(
  session: OrmSession,
  payload: NotaVersaoCreatePayload,
) {
  return createEntityFromRow(session, notaVersaoTable, payload) as unknown as NotaVersao;
}
