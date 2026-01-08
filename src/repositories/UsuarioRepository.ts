import type { OrmSession } from "metal-orm";
import { selectFromEntity, entityRefs, eq, like } from "metal-orm";
import { Usuario } from "../db/entities/Usuario.js";
import { Especializada } from "../db/entities/Especializada.js";
import { AfastamentoPessoa } from "../db/entities/AfastamentoPessoa.js";
import type { PaginatedResult } from "metal-orm";

export type UsuarioFilters = {
  especializada_id?: number;
  nome?: string;
  estado_inatividade?: boolean;
};

export const USUARIO_COLUMNS = [
  "id",
  "nome",
  "vinculo",
  "cargo",
  "especializada_id",
  "estado_inatividade",
] as const;

export const EQUIPE_COLUMNS = [
  "id",
  "nome",
] as const;

export const ESPECIALIZADA_COLUMNS = [
  "id",
  "nome",
  "sigla",
] as const;

export const AFASTAMENTO_COLUMNS = [
  "id",
  "data_inicio",
  "data_fim",
] as const;

const [U] = entityRefs(Usuario);

const createBaseQuery = (includeEquipes: boolean) => {
  let query = selectFromEntity(Usuario)
    .select(...USUARIO_COLUMNS)
    .includePick("especializada", [...ESPECIALIZADA_COLUMNS])
    .includePick("afastamentosPessoas", [...AFASTAMENTO_COLUMNS]);

  if (includeEquipes) {
    query = query.includePick("equipes", [...EQUIPE_COLUMNS]);
  }

  return query;
};

const applyFilters = (
  query: ReturnType<typeof createBaseQuery>,
  filters?: UsuarioFilters,
) => {
  let current = query;

  if (filters?.especializada_id !== undefined) {
    current = current.where(eq(U.especializada_id, filters.especializada_id));
  }

  if (filters?.nome) {
    const trimmed = filters.nome.trim();
    if (trimmed) {
      current = current.where(like(U.nome, `%${trimmed}%`));
    }
  }

  if (filters?.estado_inatividade !== undefined) {
    current = current.where(eq(U.estado_inatividade, filters.estado_inatividade));
  }

  return current;
};

export const listUsuariosPaged = async (
  session: OrmSession,
  filters?: UsuarioFilters,
  pagination?: { page?: number; pageSize?: number },
  includeEquipes = false,
): Promise<PaginatedResult<Usuario>> => {
  const query = applyFilters(createBaseQuery(includeEquipes), filters);
  const paginationParams = {
    page: pagination?.page ?? 1,
    pageSize: pagination?.pageSize ?? 50,
  };
  return query.executePaged(session, paginationParams);
};

export const listUsuarios = async (
  session: OrmSession,
  filters?: UsuarioFilters,
  includeEquipes = false,
): Promise<Usuario[]> => {
  const query = applyFilters(createBaseQuery(includeEquipes), filters);
  return query.execute(session);
};

export const findUsuario = async (
  session: OrmSession,
  id: number,
  includeEquipes = false,
): Promise<Usuario | null> => {
  const rows = (await createBaseQuery(includeEquipes)
    .where(eq(U.id, id))
    .execute(session)) as any[];
  
  if (!rows[0]) {
    return null;
  }

  const usuario = rows[0];
  const result: any = {
    id: usuario.id,
    nome: usuario.nome,
    vinculo: usuario.vinculo,
    cargo: usuario.cargo,
    especializada_id: usuario.especializada_id,
    estado_inatividade: usuario.estado_inatividade,
  };

  if (includeEquipes && usuario.equipes) {
    result.equipes = usuario.equipes;
  }

  if (usuario.especializada) {
    result.especializada = usuario.especializada;
  }

  if (usuario.afastamentosPessoas) {
    result.afastamentosPessoas = usuario.afastamentosPessoas;
  }

  return result as Usuario;
};
