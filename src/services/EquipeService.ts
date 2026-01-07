import type { OrmSession } from "metal-orm";
import { Equipe } from "../db/entities/Equipe.js";
import {
  listEquipes,
  listEquipesPaged,
  findEquipe,
  type EquipeFilters,
} from "../repositories/EquipeRepository.js";
import type { PaginatedResult } from "metal-orm";

export const list = async (
  session: OrmSession,
  filters?: EquipeFilters,
  includeUsuarios = false,
): Promise<Equipe[]> => {
  return listEquipes(session, filters, includeUsuarios);
};

export const listPaged = async (
  session: OrmSession,
  filters?: EquipeFilters,
  pagination?: { page?: number; pageSize?: number },
  includeUsuarios = false,
): Promise<PaginatedResult<Equipe>> => {
  return listEquipesPaged(session, filters, pagination, includeUsuarios);
};

export const getById = async (
  session: OrmSession,
  id: number,
  includeUsuarios = false,
): Promise<Equipe | null> => {
  return findEquipe(session, id, includeUsuarios);
};
