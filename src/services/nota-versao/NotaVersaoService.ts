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

const parseDate = (value: string | undefined, field: string): Date | undefined => {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid date for ${field}`);
  }
  return parsed;
};

export const list = (session: OrmSession, filters?: NotaVersaoFilters) =>
  listNotaVersoes(session, filters);

export const getById = (session: OrmSession, id: number) =>
  findNotaVersao(session, id);

export const create = async (session: OrmSession, input: NotaVersaoCreateInput) => {
  const entity = new NotaVersao();
  const data = parseDate(input.data, "data");
  if (!data) {
    throw new Error("Missing required field: data");
  }

  entity.data = data;
  entity.sprint = input.sprint;
  entity.ativo = input.ativo ?? true;
  entity.mensagem = input.mensagem;
  entity.data_exclusao = parseDate(input.data_exclusao, "data_exclusao");
  entity.data_inativacao = parseDate(input.data_inativacao, "data_inativacao");

  await session.persist(entity);
  await session.flush();
  return entity;
};

export const update = async (
  session: OrmSession,
  id: number,
  input: NotaVersaoUpdateInput,
) => {
  const entity = await findNotaVersao(session, id);
  if (!entity) return null;

  if (input.data !== undefined) {
    const data = parseDate(input.data, "data");
    if (!data) {
      throw new Error("Missing required field: data");
    }
    entity.data = data;
  }

  if (input.sprint !== undefined) {
    entity.sprint = input.sprint;
  }

  if (input.ativo !== undefined) {
    entity.ativo = input.ativo;
  }

  if (input.mensagem !== undefined) {
    entity.mensagem = input.mensagem;
  }

  if (input.data_exclusao !== undefined) {
    entity.data_exclusao = parseDate(input.data_exclusao, "data_exclusao");
  }

  if (input.data_inativacao !== undefined) {
    entity.data_inativacao = parseDate(input.data_inativacao, "data_inativacao");
  }

  await session.flush();
  return entity;
};
