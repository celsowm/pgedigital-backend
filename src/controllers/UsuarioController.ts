import { Controller, Get } from "adorn-api";
import type { ListQuery } from "adorn-api/metal";
import { pagedOptions } from "adorn-api/metal";
import type { Usuario } from "../db/entities/Usuario.js";
import { withSession } from "../db/orm.js";
import * as UsuarioService from "../services/UsuarioService.js";
import type { PaginatedResult } from "metal-orm";
import type { UsuarioFilters } from "../repositories/UsuarioRepository.js";

type UsuarioQuery = Omit<ListQuery<Usuario>, "where" | "include"> & {
  where?: {
    especializada_id?: number;
    nome?: string;
    estado_inatividade?: boolean;
  };
  include?: string[];
};

const toUsuarioFilters = (query?: UsuarioQuery): UsuarioFilters => {
  if (!query?.where) {
    return {};
  }

  return {
    especializada_id: query.where.especializada_id,
    nome: query.where.nome,
    estado_inatividade: query.where.estado_inatividade,
  };
};

@Controller("/usuarios")
export class UsuarioController {
  @Get("/")
  async list(query?: UsuarioQuery): Promise<PaginatedResult<Usuario>> {
    const filters = toUsuarioFilters(query);
    const includeEquipes = query?.include?.includes("equipes") ?? false;
    return withSession(session =>
      UsuarioService.listPaged(session, filters, pagedOptions(query), includeEquipes),
    );
  }

  @Get("/:id")
  async getById(id: number): Promise<Usuario | null> {
    const includeEquipes = true;
    return withSession(session => UsuarioService.getById(session, id, includeEquipes));
  }
}
