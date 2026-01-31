import {
  Body,
  Controller,
  Delete,
  Get,
  Params,
  Patch,
  Post,
  Put,
  Query,
  Returns,
  applyInput,
  parseIdOrThrow,
  type RequestContext
} from "adorn-api";
import { entityRef } from "metal-orm";
import { withSession } from "../db/mssql";
import { TipoDivisaoCargaTrabalho } from "../entities/TipoDivisaoCargaTrabalho";
import {
  TipoDivisaoCargaTrabalhoDto,
  CreateTipoDivisaoCargaTrabalhoDto,
  ReplaceTipoDivisaoCargaTrabalhoDto,
  UpdateTipoDivisaoCargaTrabalhoDto,
  TipoDivisaoCargaTrabalhoParamsDto,
  TipoDivisaoCargaTrabalhoPagedResponseDto,
  TipoDivisaoCargaTrabalhoQueryDto,
  TipoDivisaoCargaTrabalhoQueryDtoClass,
  TipoDivisaoCargaTrabalhoErrors,
  TipoDivisaoCargaTrabalhoOptionsDto,
  TipoDivisaoCargaTrabalhoOptionDto
} from "../dtos/tipo-divisao-carga-trabalho/tipo-divisao-carga-trabalho.dtos";
import { BaseController } from "../utils/base-controller";

const TipoDivisaoCargaTrabalhoRef = entityRef(TipoDivisaoCargaTrabalho);

type TipoDivisaoCargaTrabalhoFilterFields = "nome";

const TIPO_DIVISAO_CARGA_TRABALHO_FILTER_MAPPINGS = {
  nomeContains: { field: "nome", operator: "contains" }
} satisfies Record<string, { field: TipoDivisaoCargaTrabalhoFilterFields; operator: "equals" | "contains" }>;

@Controller("/tipo-divisao-carga-trabalho")
export class TipoDivisaoCargaTrabalhoController extends BaseController<TipoDivisaoCargaTrabalho, TipoDivisaoCargaTrabalhoFilterFields> {
  get entityClass() {
    return TipoDivisaoCargaTrabalho;
  }

  get entityRef(): any {
    return TipoDivisaoCargaTrabalhoRef;
  }

  get filterMappings(): Record<string, { field: TipoDivisaoCargaTrabalhoFilterFields; operator: "equals" | "contains" }> {
    return TIPO_DIVISAO_CARGA_TRABALHO_FILTER_MAPPINGS;
  }

  get entityName() {
    return "tipo divisao carga trabalho";
  }

  @Get("/options")
  @Query(TipoDivisaoCargaTrabalhoQueryDtoClass)
  @Returns(TipoDivisaoCargaTrabalhoOptionsDto)
  async listOptions(
    ctx: RequestContext<unknown, TipoDivisaoCargaTrabalhoQueryDto>
  ): Promise<TipoDivisaoCargaTrabalhoOptionDto[]> {
    return super.listOptions(ctx);
  }
}
