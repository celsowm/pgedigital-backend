import type { OrmSession } from "metal-orm";
import { NotaVersao } from "../db/entities/NotaVersao.js";
import { listNotaVersoes, listNotaVersoesPaged, findNotaVersao, type NotaVersaoFilters } from "../repositories/NotaVersaoRepository.js";
import type { PaginatedResult } from "metal-orm";

type NotaVersaoDateInput = {
  data: Date;
  data_exclusao?: Date;
  data_inativacao?: Date;
};

export type NotaVersaoCreateInput = Pick<NotaVersao, "sprint" | "ativo" | "mensagem"> &
  NotaVersaoDateInput;

export type NotaVersaoUpdateInput = Partial<Pick<NotaVersao, "sprint" | "ativo" | "mensagem">> &
  Partial<NotaVersaoDateInput>;

const withGraphDefaults = (session: OrmSession) =>
  session.withSaveGraphDefaults({
    coerce: "json-in",
    flush: true,
    transactional: false,
  });

export const list = (session: OrmSession, filters?: NotaVersaoFilters) =>
  listNotaVersoes(session, filters);

export const listPaged = (
  session: OrmSession,
  filters?: NotaVersaoFilters,
  pagination?: { page?: number; pageSize?: number },
): Promise<PaginatedResult<NotaVersao>> =>
  listNotaVersoesPaged(session, filters, pagination);

export const getById = (session: OrmSession, id: number) =>
  findNotaVersao(session, id);

export const create = async (session: OrmSession, input: NotaVersaoCreateInput) => {
  const payload = {
    ...input,
    ativo: input.ativo ?? true,
  };

  return withGraphDefaults(session).saveGraph(NotaVersao, payload);
};

export const update = async (
  session: OrmSession,
  id: number,
  input: NotaVersaoUpdateInput,
) => {
  const payload = {
    id,
    ...input,
  };

  return withGraphDefaults(session).updateGraph(NotaVersao, payload);
};
