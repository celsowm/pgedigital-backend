import {
  Controller,
  Get,
  Query,
  Returns,
  type RequestContext
} from "adorn-api";
import {
  CaixaEntradaQueryDtoClass,
  CaixaEntradaPagedResponseDto,
  CaixaEntradaErrors,
  type CaixaEntradaQueryDto
} from "../dtos/caixa-entrada/caixa-entrada.dtos";
import { CaixaEntradaService } from "../services/caixa-entrada.service";

@Controller("/caixa-entrada")
export class CaixaEntradaController {
  private readonly service = new CaixaEntradaService();

  @Get("/")
  @Query(CaixaEntradaQueryDtoClass)
  @Returns(CaixaEntradaPagedResponseDto)
  @CaixaEntradaErrors
  async list(ctx: RequestContext<unknown, CaixaEntradaQueryDto>): Promise<unknown> {
    return this.service.list(ctx.query ?? {} as CaixaEntradaQueryDto);
  }
}