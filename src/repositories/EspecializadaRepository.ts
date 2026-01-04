import type { OrmSession } from "metal-orm";
import { selectFromEntity, entityRefs, eq, like } from "metal-orm";
import { Especializada } from "../db/entities/Especializada.js";
import { Usuario } from "../db/entities/Usuario.js";
import type { Pagination, PagedResult } from "../utils/pagination.js";

export type EspecializadaFilters = {
  responsavel_id?: number;
  responsavel_nome?: string;
  tipo_especializada_id?: number;
  usa_pge_digital?: boolean;
  usa_plantao_audiencia?: boolean;
  restricao_ponto_focal?: boolean;
  especializada_triagem?: boolean;
  codigo_ad?: number;
  nome?: string;
  sigla?: string;
};

const [E, U] = entityRefs(Especializada, Usuario);

export const ESPECIALIZADA_COLUMNS = [
  "id",
  "equipe_triagem_id",
  "responsavel_id",
  "nome",
  "usa_pge_digital",
  "codigo_ad",
  "usa_plantao_audiencia",
  "tipo_divisao_carga_trabalho_id",
  "tipo_localidade_especializada_id",
  "email",
  "restricao_ponto_focal",
  "sigla",
  "tipo_especializada_id",
  "especializada_triagem",
  "caixa_entrada_max",
] as const;

const RESPONSAVEL_COLUMNS = ["id", "nome", "login", "cargo"] as const;

const createBaseQuery = () =>
  selectFromEntity(Especializada)
    .select(...ESPECIALIZADA_COLUMNS)
    .includePick("responsavel", [...RESPONSAVEL_COLUMNS]);

const applyFilters = (
  query: ReturnType<typeof createBaseQuery>,
  filters?: EspecializadaFilters,
) => {
  let current = query;

  if (filters?.responsavel_id !== undefined) {
    current = current.where(eq(E.responsavel_id, filters.responsavel_id));
  }

  if (filters?.responsavel_nome) {
    const trimmed = filters.responsavel_nome.trim();
    if (trimmed) {
      current = current.whereHas("responsavel", qb =>
        qb.where(like(U.nome, `%${trimmed}%`)),
      );
    }
  }

  if (filters?.tipo_especializada_id !== undefined) {
    current = current.where(eq(E.tipo_especializada_id, filters.tipo_especializada_id));
  }

  if (filters?.usa_pge_digital !== undefined) {
    current = current.where(eq(E.usa_pge_digital, filters.usa_pge_digital));
  }

  if (filters?.usa_plantao_audiencia !== undefined) {
    current = current.where(eq(E.usa_plantao_audiencia, filters.usa_plantao_audiencia));
  }

  if (filters?.restricao_ponto_focal !== undefined) {
    current = current.where(eq(E.restricao_ponto_focal, filters.restricao_ponto_focal));
  }

  if (filters?.especializada_triagem !== undefined) {
    current = current.where(eq(E.especializada_triagem, filters.especializada_triagem));
  }

  if (filters?.codigo_ad !== undefined) {
    current = current.where(eq(E.codigo_ad, filters.codigo_ad));
  }

  if (filters?.nome !== undefined) {
    current = current.where(eq(E.nome, filters.nome));
  }

  if (filters?.sigla !== undefined) {
    current = current.where(eq(E.sigla, filters.sigla));
  }

  return current;
};

export const listEspecializadas = async (session: OrmSession, filters?: EspecializadaFilters): Promise<Especializada[]> => {
  const query = applyFilters(createBaseQuery(), filters);
  return query.execute(session);
};

export const listEspecializadasPaged = async (
  session: OrmSession,
  filters?: EspecializadaFilters,
  pagination?: Pagination,
): Promise<PagedResult<Especializada>> => {
  const query = applyFilters(createBaseQuery(), filters);
  const paginationParams = pagination || { page: 1, pageSize: 50 };
  return query.executePaged(session, paginationParams);
};

export const findEspecializada = async (session: OrmSession, id: number) => {
  const rows = await createBaseQuery().where(eq(E.id, id)).execute(session);
  return rows[0] ?? null;
};
