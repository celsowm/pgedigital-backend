import { Controller, Get, Query, Returns, type RequestContext } from "adorn-api";
import {
  TipoProvidenciaJuridicaOptionDto,
  TipoProvidenciaJuridicaQueryDto,
  TipoProvidenciaJuridicaQueryDtoClass,
  TipoProvidenciaJuridicaOptionsQueryDto,
  TipoProvidenciaJuridicaOptionsQueryDtoClass,
  TipoProvidenciaJuridicaOptionsDto
} from "../dtos/tipo-providencia-juridica/tipo-providencia-juridica.dtos";
import { TipoProvidenciaJuridicaService } from "../services/tipo-providencia-juridica.service";

@Controller("/tipo-providencia-juridica")
export class TipoProvidenciaJuridicaController {
  private readonly service = new TipoProvidenciaJuridicaService();

  @Get("/options")
  @Query(TipoProvidenciaJuridicaOptionsQueryDtoClass)
  @Returns(TipoProvidenciaJuridicaOptionsDto)
  async listOptions(
    ctx: RequestContext<unknown, TipoProvidenciaJuridicaOptionsQueryDto>
  ): Promise<TipoProvidenciaJuridicaOptionDto[]> {
    return this.service.listOptions(ctx.query ?? {});
  }
}
