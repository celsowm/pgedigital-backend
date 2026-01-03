import { Controller, Get, Post, Put, QueryStyle } from "adorn-api";
import type { SearchWhere } from "adorn-api/metal";
import type { BelongsToReference } from "metal-orm";
import type { Especializada } from "../db/entities/Especializada.js";
import type { Usuario } from "../db/entities/Usuario.js";
import { withSession } from "../db/orm.js";
import * as EspecializadaService from "../services/EspecializadaService.js";

type EspecializadaWhereModel = Pick<
  Especializada,
  | "responsavel_id"
  | "tipo_especializada_id"
  | "usa_pge_digital"
  | "usa_plantao_audiencia"
  | "restricao_ponto_focal"
  | "especializada_triagem"
  | "codigo_ad"
  | "nome"
  | "sigla"
> & {
  responsavel?: BelongsToReference<Pick<Usuario, "id" | "nome">>;
};

type EspecializadaWhere = SearchWhere<EspecializadaWhereModel, { maxDepth: 1 }>;

type EspecializadaFilters = {
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

const toEspecializadaFilters = (
  where?: EspecializadaWhere,
): EspecializadaFilters | undefined => {
  if (!where || Object.keys(where).length === 0) {
    return undefined;
  }

  const filters: EspecializadaFilters = {};
  const responsavelWhere = where.responsavel;

  if (where.responsavel_id !== undefined) {
    filters.responsavel_id = where.responsavel_id;
  } else if (responsavelWhere?.id !== undefined) {
    filters.responsavel_id = responsavelWhere.id;
  }

  if (responsavelWhere?.nome !== undefined) {
    filters.responsavel_nome = responsavelWhere.nome;
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

  return filters;
};

@Controller("/especializada")
export class EspecializadaController {
  @Get("/")
  @QueryStyle({ style: "deepObject" })
  async list(
    where?: EspecializadaWhere,
  ): Promise<EspecializadaService.EspecializadaResponse[]> {
    const filters = toEspecializadaFilters(where);

    return withSession(session => EspecializadaService.list(session, filters));
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
