import { Controller, Get } from "adorn-api";
import type { ListQuery } from "adorn-api/metal";
import { pagedOptions } from "adorn-api/metal";
import type { Equipe } from "../db/entities/Equipe.js";
import { withSession } from "../db/orm.js";
import * as EquipeService from "../services/EquipeService.js";
import type { PaginatedResult } from "metal-orm";

type EquipeQuery = Omit<ListQuery<Equipe>, "where" | "include"> & {
  where?: {
    especializada_id?: number;
    nome?: string;
  };
  include?: string[];
};

const toEquipeFilters = (query?: EquipeQuery): { especializada_id?: number; nome?: string } => {
  if (!query?.where) {
    return {};
  }

  return {
    especializada_id: query.where.especializada_id,
    nome: query.where.nome,
  };
};

@Controller("/equipes")
export class EquipeController {
  @Get("/")
  async list(query?: EquipeQuery): Promise<PaginatedResult<Equipe>> {
    const filters = toEquipeFilters(query);
    const includeUsuarios = query?.include?.includes("usuarios") ?? false;
    return withSession(session =>
      EquipeService.listPaged(session, filters, pagedOptions(query), includeUsuarios),
    );
  }

  @Get("/:id")
  async getById(id: number): Promise<Equipe | null> {
    const includeUsuarios = true;
    return withSession(session => EquipeService.getById(session, id, includeUsuarios));
  }
}
