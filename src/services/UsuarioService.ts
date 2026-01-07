import type { OrmSession } from "metal-orm";
import { Usuario } from "../db/entities/Usuario.js";
import {
  listUsuarios,
  listUsuariosPaged,
  findUsuario,
  type UsuarioFilters,
} from "../repositories/UsuarioRepository.js";
import type { PaginatedResult } from "metal-orm";

export const list = async (
  session: OrmSession,
  filters?: UsuarioFilters,
  includeEquipes = false,
): Promise<Usuario[]> => {
  return listUsuarios(session, filters, includeEquipes);
};

export const listPaged = async (
  session: OrmSession,
  filters?: UsuarioFilters,
  pagination?: { page?: number; pageSize?: number },
  includeEquipes = false,
): Promise<PaginatedResult<Usuario>> => {
  return listUsuariosPaged(session, filters, pagination, includeEquipes);
};

export const getById = async (
  session: OrmSession,
  id: number,
  includeEquipes = false,
): Promise<Usuario | null> => {
  return findUsuario(session, id, includeEquipes);
};
