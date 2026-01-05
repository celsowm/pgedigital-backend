import { Controller, Get, Post, Put} from "adorn-api";
import type { SearchWhere, ListQuery } from "adorn-api/metal";
import { pagedOptions } from "adorn-api/metal";
import type { Especializada } from "../db/entities/Especializada.js";
import { withSession } from "../db/orm.js";
import * as EspecializadaService from "../services/EspecializadaService.js";
import type { PaginatedResult } from "metal-orm";

import type { EspecializadaFilters } from "../repositories/EspecializadaRepository.js";

type EspecializadaWhere = SearchWhere<Especializada, {
  include: [
    "nome",
    "responsavel.nome"
  ];
}>;

type EspecializadaQuery =
  Omit<ListQuery<Especializada>, "where"> & {
    where?: EspecializadaWhere;
  };

type NestedWhere<T> = {
  [K in keyof T]?: T[K] extends object ? NestedWhere<T[K]> : T[K];
};

const toEspecializadaFilters = (query?: EspecializadaQuery): EspecializadaFilters => {
  if (!query?.where) {
    return {};
  }

  const filters: EspecializadaFilters = {};
  const where = query.where as NestedWhere<EspecializadaWhere>;

  if (where.nome !== undefined) {
    filters.nome = where.nome;
  }

  const responsavel = where.responsavel as NestedWhere<{ nome?: string }> | undefined;
  if (responsavel?.nome !== undefined) {
    filters.responsavel_nome = responsavel.nome;
  }

  return filters;
};

@Controller("/especializada")
export class EspecializadaController {

  @Get("/")
  async list(query?: EspecializadaQuery): Promise<PaginatedResult<Especializada>> {
    const filters = toEspecializadaFilters(query);
    return withSession(session => EspecializadaService.listPaged(session, filters, pagedOptions(query)));
  }

  @Get("/:id")
  async getById(id: number): Promise<Especializada | null> {
    return withSession(session => EspecializadaService.getById(session, id));
  }

  @Post("/")
  async create(
    body: EspecializadaService.EspecializadaCreateInput,
  ): Promise<Especializada> {
    return withSession(session => EspecializadaService.create(session, body));
  }

  @Put("/:id")
  async update(
    id: number,
    body: EspecializadaService.EspecializadaUpdateInput,
  ): Promise<Especializada | null> {
    return withSession(session => EspecializadaService.update(session, id, body));
  }
}
