import { Controller, Get, Post, Put } from "adorn-api";
import { withSession } from "../../db/orm.js";
import * as EspecializadaService from "../../services/especializada/EspecializadaService.js";

type EspecializadaQuery = {
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

@Controller("/especializada")
export class EspecializadaController {
  @Get("/")
  async list(
    responsavel_id?: number,
    responsavel_nome?: string,
    tipo_especializada_id?: number,
    usa_pge_digital?: boolean,
    usa_plantao_audiencia?: boolean,
    restricao_ponto_focal?: boolean,
    especializada_triagem?: boolean,
    codigo_ad?: number,
    nome?: string,
    sigla?: string,
  ): Promise<EspecializadaService.EspecializadaResponse[]> {
    const query: EspecializadaQuery = {
      responsavel_id,
      responsavel_nome,
      tipo_especializada_id,
      usa_pge_digital,
      usa_plantao_audiencia,
      restricao_ponto_focal,
      especializada_triagem,
      codigo_ad,
      nome,
      sigla,
    };

    return withSession(session => EspecializadaService.list(session, query));
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
