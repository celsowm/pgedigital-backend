import { Controller, Get, Query, Returns, type RequestContext } from "adorn-api";
import {
  TipoProvidenciaJuridicaOptionDto,
  TipoProvidenciaJuridicaQueryDto,
  TipoProvidenciaJuridicaQueryDtoClass,
  TipoProvidenciaJuridicaOptionsDto
} from "../dtos/tipo-providencia-juridica/tipo-providencia-juridica.dtos";
import { TipoProvidenciaJuridicaService } from "../services/tipo-providencia-juridica.service";

@Controller("/tipo-providencia-juridica")
export class TipoProvidenciaJuridicaController {
  private readonly service = new TipoProvidenciaJuridicaService();

  @Get("/options")
  @Query(TipoProvidenciaJuridicaQueryDtoClass)
  @Returns(TipoProvidenciaJuridicaOptionsDto)
  async listOptions(
    ctx: RequestContext<unknown, TipoProvidenciaJuridicaQueryDto>
  ): Promise<TipoProvidenciaJuridicaOptionDto[]> {
    return this.service.listOptions(ctx.query ?? {});
  }
}
