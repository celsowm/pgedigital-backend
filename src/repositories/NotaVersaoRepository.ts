import type { OrmSession } from "metal-orm";
import { selectFromEntity, entityRef, eq } from "metal-orm";
import { NotaVersao } from "../db/entities/NotaVersao.js";
import type { Pagination, PagedResult } from "../utils/pagination.js";

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

  return query.execute(session);
};

export const listNotaVersoesPaged = async (
  session: OrmSession,
  filters?: NotaVersaoFilters,
  pagination?: Pagination,
): Promise<PagedResult<NotaVersao>> => {
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

  const paginationParams = pagination || { page: 1, pageSize: 50 };
  return query.executePaged(session, paginationParams);
};

export const findNotaVersao = (session: OrmSession, id: number) => session.find(NotaVersao, id);
