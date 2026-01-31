import { Controller, Get, Query, Returns, type RequestContext } from "adorn-api";
import { entityRef } from "metal-orm";
import { TipoProcessoAdministrativo } from "../entities/TipoProcessoAdministrativo";
import {
  TipoProcessoAdministrativoOptionDto,
  TipoProcessoAdministrativoQueryDto,
  TipoProcessoAdministrativoQueryDtoClass,
  TipoProcessoAdministrativoOptionsDto
} from "../dtos/tipo-processo-administrativo/tipo-processo-administrativo.dtos";
import { BaseController } from "../utils/base-controller";

const TipoProcessoAdministrativoRef = entityRef(TipoProcessoAdministrativo);

type TipoProcessoAdministrativoFilterFields = "nome";

const TIPO_PROCESSO_ADMINISTRATIVO_FILTER_MAPPINGS = {
  nomeContains: { field: "nome", operator: "contains" }
} satisfies Record<string, { field: TipoProcessoAdministrativoFilterFields; operator: "equals" | "contains" }>;

@Controller("/tipo-processo-administrativo")
export class TipoProcessoAdministrativoController extends BaseController<TipoProcessoAdministrativo, TipoProcessoAdministrativoFilterFields> {
  get entityClass() {
    return TipoProcessoAdministrativo;
  }

  get entityRef(): any {
    return TipoProcessoAdministrativoRef;
  }

  get filterMappings(): Record<string, { field: TipoProcessoAdministrativoFilterFields; operator: "equals" | "contains" }> {
    return TIPO_PROCESSO_ADMINISTRATIVO_FILTER_MAPPINGS;
  }

  get entityName() {
    return "tipo de processo administrativo";
  }

  @Get("/options")
  @Query(TipoProcessoAdministrativoQueryDtoClass)
  @Returns(TipoProcessoAdministrativoOptionsDto)
  async listOptions(
    ctx: RequestContext<unknown, TipoProcessoAdministrativoQueryDto>
  ): Promise<TipoProcessoAdministrativoOptionDto[]> {
    return super.listOptions(ctx);
  }
}
