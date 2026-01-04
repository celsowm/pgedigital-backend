import { Controller, Get, Post, Put, QueryStyle } from "adorn-api";
import type { SearchWhere } from "adorn-api/metal";
import type { Especializada } from "../db/entities/Especializada.js";
import { withSession } from "../db/orm.js";
import type { EspecializadaFilters } from "../repositories/EspecializadaRepository.js";
import * as EspecializadaService from "../services/EspecializadaService.js";
import type { PaginatedResult } from "metal-orm";

type EspecializadaWhere = SearchWhere<Especializada, {
  maxDepth: 1;
  include: [
    "responsavel_id",
    "tipo_especializada_id",
    "usa_pge_digital",
    "usa_plantao_audiencia",
    "restricao_ponto_focal",
    "especializada_triagem",
    "codigo_ad",
    "nome",
    "sigla",
    "responsavel.id",
    "responsavel.nome",
  ];
}>;

const toEspecializadaFilters = (
  where?: EspecializadaWhere,
): EspecializadaFilters | undefined => {
  if (!where) return undefined;

  const filters: EspecializadaFilters = {};

  if (where.responsavel_id !== undefined) {
    filters.responsavel_id = where.responsavel_id;
  }

  if (where.tipo_especializada_id !== undefined) {
    filters.tipo_especializada_id = where.tipo_especializada_id;
  }

  if (where.usa_pge_digital !== undefined) {
    filters.usa_pge_digital = where.usa_pge_digital;
  }

  if (where.usa_plantao_audiencia !== undefined) {
    filters.usa_plantao_audiencia = where.usa_plantao_audiencia;
  }

  if (where.restricao_ponto_focal !== undefined) {
    filters.restricao_ponto_focal = where.restricao_ponto_focal;
  }

  if (where.especializada_triagem !== undefined) {
    filters.especializada_triagem = where.especializada_triagem;
  }

  if (where.codigo_ad !== undefined) {
    filters.codigo_ad = where.codigo_ad;
  }

  if (where.nome !== undefined) {
    filters.nome = where.nome;
  }

  if (where.sigla !== undefined) {
    filters.sigla = where.sigla;
  }

  if (where.responsavel?.id !== undefined && filters.responsavel_id === undefined) {
    filters.responsavel_id = where.responsavel.id;
  }

  if (where.responsavel?.nome !== undefined) {
    filters.responsavel_nome = where.responsavel.nome;
  }

  return Object.keys(filters).length ? filters : undefined;
};


@Controller("/especializada")
export class EspecializadaController {
  @Get("/")
  @QueryStyle({ style: "deepObject" })
  async list(
    where?: EspecializadaWhere,
    pagination?: { page?: number; pageSize?: number },
  ): Promise<PaginatedResult<EspecializadaService.EspecializadaResponse>> {
    const filters = toEspecializadaFilters(where);

    return withSession(session => EspecializadaService.listPaged(session, filters, pagination));
  }

  @Get("/:id")
  async getById(id: number): Promise<EspecializadaService.EspecializadaResponse | null> {
    return withSession(session => EspecializadaService.getById(session, id));
  }

  @Post("/")
  async create(
    body: EspecializadaService.EspecializadaCreateInput,
  ): Promise<EspecializadaService.EspecializadaResponse> {
    return withSession(session => EspecializadaService.create(session, body));
  }

  @Put("/:id")
  async update(
    id: number,
    body: EspecializadaService.EspecializadaUpdateInput,
  ): Promise<EspecializadaService.EspecializadaResponse | null> {
    return withSession(session => EspecializadaService.update(session, id, body));
  }
}
