import { Controller, Get, Query, Returns, type RequestContext } from "adorn-api";
import { entityRef } from "metal-orm";
import { TipoAudiencia } from "../entities/TipoAudiencia";
import {
  TipoAudienciaOptionDto,
  TipoAudienciaOptionsDto,
  TipoAudienciaPagedResponseDto,
  TipoAudienciaQueryDto,
  TipoAudienciaQueryDtoClass
} from "../dtos/tipo-audiencia/tipo-audiencia.dtos";
import { BaseController } from "../utils/base-controller";

const TipoAudienciaRef = entityRef(TipoAudiencia);

type TipoAudienciaFilterFields = "descricao" | "tipo_processo_administrativo_id";

const TIPO_AUDIENCIA_FILTER_MAPPINGS = {
  descricaoContains: { field: "descricao" as TipoAudienciaFilterFields, operator: "contains" },
  tipoProcessoAdministrativoId: { field: "tipo_processo_administrativo_id" as TipoAudienciaFilterFields, operator: "equals" }
} satisfies Record<string, { field: TipoAudienciaFilterFields; operator: "equals" | "contains" }>;

@Controller("/tipo-audiencia")
export class TipoAudienciaController extends BaseController<TipoAudiencia, TipoAudienciaFilterFields> {
  get entityClass() {
    return TipoAudiencia;
  }

  get entityRef(): any {
    return TipoAudienciaRef;
  }

  get filterMappings(): Record<string, { field: TipoAudienciaFilterFields; operator: "equals" | "contains" }> {
    return TIPO_AUDIENCIA_FILTER_MAPPINGS;
  }

  get entityName() {
    return "tipo audiencia";
  }

  protected get optionsLabelField(): string {
    return "descricao";
  }

  @Get("/")
  @Query(TipoAudienciaQueryDtoClass)
  @Returns(TipoAudienciaPagedResponseDto)
  async list(ctx: RequestContext<unknown, TipoAudienciaQueryDto>): Promise<unknown> {
    return super.list(ctx);
  }

  @Get("/options")
  @Query(TipoAudienciaQueryDtoClass)
  @Returns(TipoAudienciaOptionsDto)
  async listOptions(ctx: RequestContext<unknown, TipoAudienciaQueryDto>): Promise<TipoAudienciaOptionDto[]> {
    return super.listOptions(ctx);
  }
}
