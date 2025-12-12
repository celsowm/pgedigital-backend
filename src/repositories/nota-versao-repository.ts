import {
  OrmSession,
  createEntityFromRow,
  esel,
  eq,
  isNull,
  count,
  selectFromEntity,
} from 'metal-orm';
import { NotaVersao } from '../entities/index.js';
import { notaVersaoTable } from '../entities/index.js';

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
  let builder = selectFromEntity(NotaVersao);

  if (options?.sprint !== undefined) {
    builder = builder.where(eq(notaVersaoTable.columns.sprint, options.sprint));
  }

  if (options?.ativo !== undefined) {
    builder = builder.where(eq(notaVersaoTable.columns.ativo, options.ativo));
  } else if (!options?.includeDeleted) {
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

  return builder.execute(session) as unknown as Promise<NotaVersao[]>;
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
  const [entity] = await selectFromEntity(NotaVersao)
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
