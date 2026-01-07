import type { OrmSession } from "metal-orm";
import { selectFromEntity, entityRefs, eq, like } from "metal-orm";
import { Usuario } from "../db/entities/Usuario.js";
import type { PaginatedResult } from "metal-orm";

export type UsuarioFilters = {
  especializada_id?: number;
  nome?: string;
  estado_inatividade?: boolean;
};

export const USUARIO_COLUMNS = [
  "id",
  "nome",
  "login",
  "cargo",
  "especializada_id",
  "estado_inatividade",
  "vinculo",
  "funcao",
  "matricula",
] as const;

export const EQUIPE_COLUMNS = [
  "id",
  "nome",
] as const;

const [U] = entityRefs(Usuario);

const createBaseQuery = (includeEquipes: boolean) => {
  let query = selectFromEntity(Usuario)
    .select(...USUARIO_COLUMNS);

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
  const rows = await createBaseQuery(includeEquipes)
    .where(eq(U.id, id))
    .execute(session);
  return rows[0] ?? null;
};
