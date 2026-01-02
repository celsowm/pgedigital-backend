import type { OrmSession } from "metal-orm";
import { NotaVersao } from "../../db/entities/NotaVersao.js";
import { listNotaVersoes, findNotaVersao, type NotaVersaoFilters } from "../../repositories/nota-versao/NotaVersaoRepository.js";

type NotaVersaoDateInput = {
  data: string;
  data_exclusao?: string;
  data_inativacao?: string;
};

export type NotaVersaoCreateInput = Pick<NotaVersao, "sprint" | "ativo" | "mensagem"> &
  NotaVersaoDateInput;

export type NotaVersaoUpdateInput = Partial<Pick<NotaVersao, "sprint" | "ativo" | "mensagem">> &
  Partial<NotaVersaoDateInput>;

const requireDate = (value: string | undefined, field: string) => {
  if (!value) {
    throw new Error(`Missing required field: ${field}`);
  }
  return value;
};

const normalizeDateInput = (value: string | undefined) => (value ? value : undefined);

export const list = (session: OrmSession, filters?: NotaVersaoFilters) =>
  listNotaVersoes(session, filters);

export const getById = (session: OrmSession, id: number) =>
  findNotaVersao(session, id);

export const create = async (session: OrmSession, input: NotaVersaoCreateInput) => {
  const payload = {
    ...input,
    data: requireDate(input.data, "data"),
    ativo: input.ativo ?? true,
    data_exclusao: normalizeDateInput(input.data_exclusao),
    data_inativacao: normalizeDateInput(input.data_inativacao),
  };

  return session.saveGraphAndFlush(NotaVersao, payload, { coerce: "json-in" });
};

export const update = async (
  session: OrmSession,
  id: number,
  input: NotaVersaoUpdateInput,
) => {
  const payload = {
    id,
    ...input,
    data: input.data !== undefined ? requireDate(input.data, "data") : undefined,
    data_exclusao: normalizeDateInput(input.data_exclusao),
    data_inativacao: normalizeDateInput(input.data_inativacao),
  };

  return session.updateGraph(NotaVersao, payload, {
    coerce: "json-in",
    flush: true,
    transactional: false,
  });
};
