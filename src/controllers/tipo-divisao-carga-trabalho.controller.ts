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
  parseIdOrThrow,
  type RequestContext
} from "adorn-api";
import {
  TipoDivisaoCargaTrabalhoDto,
  CreateTipoDivisaoCargaTrabalhoDto,
  ReplaceTipoDivisaoCargaTrabalhoDto,
  UpdateTipoDivisaoCargaTrabalhoDto,
  TipoDivisaoCargaTrabalhoParamsDto,
  TipoDivisaoCargaTrabalhoPagedResponseDto,
  TipoDivisaoCargaTrabalhoQueryDto,
  TipoDivisaoCargaTrabalhoQueryDtoClass,
  TipoDivisaoCargaTrabalhoOptionsQueryDto,
  TipoDivisaoCargaTrabalhoOptionsQueryDtoClass,
  TipoDivisaoCargaTrabalhoErrors,
  TipoDivisaoCargaTrabalhoOptionsDto,
  TipoDivisaoCargaTrabalhoOptionDto
} from "../dtos/tipo-divisao-carga-trabalho/tipo-divisao-carga-trabalho.dtos";
import { TipoDivisaoCargaTrabalhoService } from "../services/tipo-divisao-carga-trabalho.service";

@Controller("/tipo-divisao-carga-trabalho")
export class TipoDivisaoCargaTrabalhoController {
  private readonly service = new TipoDivisaoCargaTrabalhoService();

  @Get("/options")
  @Query(TipoDivisaoCargaTrabalhoOptionsQueryDtoClass)
  @Returns(TipoDivisaoCargaTrabalhoOptionsDto)
  async listOptions(
    ctx: RequestContext<unknown, TipoDivisaoCargaTrabalhoOptionsQueryDto>
  ): Promise<TipoDivisaoCargaTrabalhoOptionDto[]> {
    return this.service.listOptions(ctx.query ?? {});
  }
}
