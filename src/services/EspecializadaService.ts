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

type EspecializadaBaseColumn = (typeof ESPECIALIZADA_COLUMNS)[number];
type EspecializadaSummary = Pick<Especializada, EspecializadaBaseColumn>;
type EspecializadaResponsavelSummary = Pick<Usuario, "id" | "nome" | "login" | "cargo">;

export type EspecializadaResponse = EspecializadaSummary & {
  responsavel?: EspecializadaResponsavelSummary | null;
};

const withGraphDefaults = (session: OrmSession) =>
  session.withSaveGraphDefaults({
    coerce: "json-in",
    flush: true,
    transactional: false,
  });

const copyBaseColumns = (entity: Especializada): EspecializadaSummary => {
  const snapshot = {} as Record<EspecializadaBaseColumn, Especializada[EspecializadaBaseColumn]>;
  for (const column of ESPECIALIZADA_COLUMNS) {
    snapshot[column] = entity[column];
  }
  return snapshot as EspecializadaSummary;
};

const toResponsavelSummary = (responsavel?: Usuario | null): EspecializadaResponsavelSummary | null => {
  if (!responsavel) return null;
  return {
    id: responsavel.id,
    nome: responsavel.nome,
    login: responsavel.login,
    cargo: responsavel.cargo,
  };
};

const toResponse = (entity: Especializada): EspecializadaResponse => ({
  ...copyBaseColumns(entity),
  responsavel: toResponsavelSummary(entity.responsavel?.get?.() ?? null),
});

export const list = async (session: OrmSession, filters?: EspecializadaFilters): Promise<Especializada[]> => {
  const rows = await listEspecializadas(session, filters);
  return rows;
};

export const listPaged = async (
  session: OrmSession,
  filters?: EspecializadaFilters,
  pagination?: { page?: number; pageSize?: number },
): Promise<PaginatedResult<EspecializadaResponse>> => {
  const pagedResult = await listEspecializadasPaged(session, filters, pagination);
  
  return {
    ...pagedResult,
    items: pagedResult.items.map(toResponse),
  };
};

export const getById = async (session: OrmSession, id: number): Promise<EspecializadaResponse | null> => {
  const record = await findEspecializada(session, id);
  return record ? toResponse(record) : null;
};

export const create = async (session: OrmSession, input: EspecializadaCreateInput): Promise<EspecializadaResponse> => {
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
  return toResponse(record);
};

export const update = async (
  session: OrmSession,
  id: number,
  input: EspecializadaUpdateInput,
): Promise<EspecializadaResponse | null> => {
  const payload = {
    id,
    ...input,
  };

  await withGraphDefaults(session).updateGraph(Especializada, payload);
  const record = await findEspecializada(session, id);
  return record ? toResponse(record) : null;
};
