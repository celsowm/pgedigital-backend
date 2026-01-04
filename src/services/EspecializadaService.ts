import type { OrmSession } from "metal-orm";
import { Especializada } from "../db/entities/Especializada.js";
import { Usuario } from "../db/entities/Usuario.js";
import {
  listEspecializadas,
  listEspecializadasPaged,
  findEspecializada,
  type EspecializadaFilters,
  ESPECIALIZADA_COLUMNS,
} from "../repositories/EspecializadaRepository.js";
import type { PaginatedResult } from "metal-orm";

type EspecializadaOptionalInput = Partial<
  Pick<
    Especializada,
    | "equipe_triagem_id"
    | "tipo_divisao_carga_trabalho_id"
    | "tipo_localidade_especializada_id"
    | "email"
    | "restricao_ponto_focal"
    | "sigla"
    | "tipo_especializada_id"
    | "especializada_triagem"
    | "caixa_entrada_max"
  >
>;

export type EspecializadaCreateInput = Pick<
  Especializada,
  "responsavel_id" | "nome" | "usa_pge_digital" | "codigo_ad" | "usa_plantao_audiencia"
> &
  EspecializadaOptionalInput;

export type EspecializadaUpdateInput = Partial<
  Pick<
    Especializada,
    | "responsavel_id"
    | "nome"
    | "usa_pge_digital"
    | "codigo_ad"
    | "usa_plantao_audiencia"
    | "equipe_triagem_id"
    | "tipo_divisao_carga_trabalho_id"
    | "tipo_localidade_especializada_id"
    | "email"
    | "restricao_ponto_focal"
    | "sigla"
    | "tipo_especializada_id"
    | "especializada_triagem"
    | "caixa_entrada_max"
  >
>;

const withGraphDefaults = (session: OrmSession) =>
  session.withSaveGraphDefaults({
    coerce: "json-in",
    flush: true,
    transactional: false,
  });

export const list = async (session: OrmSession, filters?: EspecializadaFilters): Promise<Especializada[]> => {
  const rows = await listEspecializadas(session, filters);
  return rows;
};

export const listPaged = async (
  session: OrmSession,
  filters?: EspecializadaFilters,
  pagination?: { page?: number; pageSize?: number },
): Promise<PaginatedResult<Especializada>> => {
  const pagedResult = await listEspecializadasPaged(session, filters, pagination);
  
  return pagedResult;
};

export const getById = async (session: OrmSession, id: number): Promise<Especializada | null> => {
  const record = await findEspecializada(session, id);
  return record;
};

export const create = async (session: OrmSession, input: EspecializadaCreateInput): Promise<Especializada> => {
  const payload = {
    ...input,
    restricao_ponto_focal: input.restricao_ponto_focal ?? false,
    especializada_triagem: input.especializada_triagem ?? false,
  };

  const saved = await withGraphDefaults(session).saveGraph(Especializada, payload);
  const record = await findEspecializada(session, saved.id);
  if (!record) {
    throw new Error("Failed to load especializada after insert");
  }
  return record;
};

export const update = async (
  session: OrmSession,
  id: number,
  input: EspecializadaUpdateInput,
): Promise<Especializada | null> => {
  const payload = {
    id,
    ...input,
  };

  await withGraphDefaults(session).updateGraph(Especializada, payload);
  const record = await findEspecializada(session, id);
  return record;
};
