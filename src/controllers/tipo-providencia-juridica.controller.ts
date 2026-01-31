import { Controller, Get, Query, Returns, type RequestContext } from "adorn-api";
import { entityRef } from "metal-orm";
import { TipoProvidenciaJuridica } from "../entities/TipoProvidenciaJuridica";
import {
  TipoProvidenciaJuridicaOptionDto,
  TipoProvidenciaJuridicaQueryDto,
  TipoProvidenciaJuridicaQueryDtoClass,
  TipoProvidenciaJuridicaOptionsDto
} from "../dtos/tipo-providencia-juridica/tipo-providencia-juridica.dtos";
import { BaseController } from "../utils/base-controller";

const TipoProvidenciaJuridicaRef = entityRef(TipoProvidenciaJuridica);

type TipoProvidenciaJuridicaFilterFields = "nome";

const TIPO_PROVIDENCIA_JURIDICA_FILTER_MAPPINGS = {
  nomeContains: { field: "nome", operator: "contains" }
} satisfies Record<string, { field: TipoProvidenciaJuridicaFilterFields; operator: "equals" | "contains" }>;

@Controller("/tipo-providencia-juridica")
export class TipoProvidenciaJuridicaController extends BaseController<TipoProvidenciaJuridica, TipoProvidenciaJuridicaFilterFields> {
  get entityClass() {
    return TipoProvidenciaJuridica;
  }

  get entityRef(): any {
    return TipoProvidenciaJuridicaRef;
  }

  get filterMappings(): Record<string, { field: TipoProvidenciaJuridicaFilterFields; operator: "equals" | "contains" }> {
    return TIPO_PROVIDENCIA_JURIDICA_FILTER_MAPPINGS;
  }

  get entityName() {
    return "tipo de providência jurídica";
  }

  @Get("/options")
  @Query(TipoProvidenciaJuridicaQueryDtoClass)
  @Returns(TipoProvidenciaJuridicaOptionsDto)
  async listOptions(
    ctx: RequestContext<unknown, TipoProvidenciaJuridicaQueryDto>
  ): Promise<TipoProvidenciaJuridicaOptionDto[]> {
    return super.listOptions(ctx);
  }
}
