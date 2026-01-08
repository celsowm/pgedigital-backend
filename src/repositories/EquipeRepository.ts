import type { OrmSession } from "metal-orm";
import { selectFromEntity, entityRefs, eq, like } from "metal-orm";
import { Equipe } from "../db/entities/Equipe.js";
import { Usuario } from "../db/entities/Usuario.js";
import { Especializada } from "../db/entities/Especializada.js";
import type { PaginatedResult } from "metal-orm";

export type EquipeFilters = {
  especializada_id?: number;
  nome?: string;
};

export const EQUIPE_COLUMNS = [
  "id",
  "nome",
  "especializada_id",
  "fila_circular_id",
] as const;

export const USUARIO_COLUMNS = [
  "id",
  "nome",
  "login",
  "cargo",
  "especializada_id",
] as const;

export const ESPECIALIZADA_COLUMNS = [
  "nome",
  "sigla",
] as const;

const [E, U, ESP] = entityRefs(Equipe, Usuario, Especializada);

const createBaseQuery = (includeUsuarios: boolean) => {
  let query = selectFromEntity(Equipe)
    .select(...EQUIPE_COLUMNS);

  if (includeUsuarios) {
    query = query.includePick("usuarios", [...USUARIO_COLUMNS]);
  }

  query = query.includePick("especializada", [...ESPECIALIZADA_COLUMNS]);

  return query;
};

const applyFilters = (
  query: ReturnType<typeof createBaseQuery>,
  filters?: EquipeFilters,
) => {
  let current = query;

  if (filters?.especializada_id !== undefined) {
    current = current.where(eq(E.especializada_id, filters.especializada_id));
  }

  if (filters?.nome) {
    const trimmed = filters.nome.trim();
    if (trimmed) {
      current = current.where(like(E.nome, `%${trimmed}%`));
    }
  }

  return current;
};

export const listEquipesPaged = async (
  session: OrmSession,
  filters?: EquipeFilters,
  pagination?: { page?: number; pageSize?: number },
  includeUsuarios = false,
): Promise<PaginatedResult<Equipe>> => {
  const query = applyFilters(createBaseQuery(includeUsuarios), filters);
  const paginationParams = {
    page: pagination?.page ?? 1,
    pageSize: pagination?.pageSize ?? 50,
  };
  return query.executePaged(session, paginationParams);
};

export const listEquipes = async (
  session: OrmSession,
  filters?: EquipeFilters,
  includeUsuarios = false,
): Promise<Equipe[]> => {
  const query = applyFilters(createBaseQuery(includeUsuarios), filters);
  return query.execute(session);
};

export const findEquipe = async (
  session: OrmSession,
  id: number,
  includeUsuarios = false,
): Promise<Equipe | null> => {
  const rows = await createBaseQuery(includeUsuarios)
    .where(eq(E.id, id))
    .execute(session);
  
  if (!rows[0]) {
    return null;
  }

  const equipe = rows[0];
  const result: Partial<Equipe> = {
    id: equipe.id,
    nome: equipe.nome,
    especializada_id: equipe.especializada_id,
    fila_circular_id: equipe.fila_circular_id,
  };

  if (includeUsuarios && equipe.usuarios) {
    (result as any).usuarios = equipe.usuarios;
  }

  if (equipe.especializada) {
    (result as any).especializada = equipe.especializada;
  }

  return result as Equipe;
};
