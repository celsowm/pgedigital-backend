import { OrmSession, createEntityFromRow, esel, eq, isNull } from 'metal-orm';
import { selectFromEntity } from 'metal-orm/decorators';
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
}

export interface NotaVersaoCreatePayload {
  data: Date;
  sprint: number;
  mensagem: string;
  ativo: boolean;
}

export async function listNotaVersaoEntities(
  session: OrmSession,
  options?: NotaVersaoListOptions,
) {
  let builder = selectFromEntity(NotaVersao)
    .select(getSelection())
    .orderBy(notaVersaoTable.columns.data, 'DESC');

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

  return builder.execute(session);
}

export async function findNotaVersaoById(
  session: OrmSession,
  id: number,
) {
  const [entity] = await selectFromEntity(NotaVersao)
    .select(getSelection())
    .where(eq(notaVersaoTable.columns.id, id))
    .execute(session);
  return entity ?? null;
}

export function createNotaVersaoRecord(
  session: OrmSession,
  payload: NotaVersaoCreatePayload,
) {
  return createEntityFromRow(session, notaVersaoTable, payload);
}
