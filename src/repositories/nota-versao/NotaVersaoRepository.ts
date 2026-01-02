import type { OrmSession } from "metal-orm";
import { selectFromEntity, entityRef, eq } from "metal-orm";
import { NotaVersao } from "../../db/entities/NotaVersao.js";

export type NotaVersaoFilters = {
  ativo?: boolean;
  sprint?: number;
};

export const listNotaVersoes = async (session: OrmSession, filters?: NotaVersaoFilters) => {
  const NV = entityRef(NotaVersao);
  let query = selectFromEntity(NotaVersao).select(
    "id",
    "data",
    "sprint",
    "ativo",
    "mensagem",
    "data_exclusao",
    "data_inativacao",
  );

  if (filters?.ativo !== undefined) {
    query = query.where(eq(NV.ativo, filters.ativo));
  }

  if (filters?.sprint !== undefined) {
    query = query.where(eq(NV.sprint, filters.sprint));
  }

  return query.executePlain(session);
};

export const findNotaVersao = (session: OrmSession, id: number) => session.find(NotaVersao, id);
