import { Controller, Get, Query, Returns, type RequestContext } from "adorn-api";
import {
  TipoProcessoAdministrativoOptionDto,
  TipoProcessoAdministrativoQueryDto,
  TipoProcessoAdministrativoQueryDtoClass,
  TipoProcessoAdministrativoOptionsQueryDto,
  TipoProcessoAdministrativoOptionsQueryDtoClass,
  TipoProcessoAdministrativoOptionsDto
} from "../dtos/tipo-processo-administrativo/tipo-processo-administrativo.dtos";
import { TipoProcessoAdministrativoService } from "../services/tipo-processo-administrativo.service";

@Controller("/tipo-processo-administrativo")
export class TipoProcessoAdministrativoController {
  private readonly service = new TipoProcessoAdministrativoService();

  @Get("/options")
  @Query(TipoProcessoAdministrativoOptionsQueryDtoClass)
  @Returns(TipoProcessoAdministrativoOptionsDto)
  async listOptions(
    ctx: RequestContext<unknown, TipoProcessoAdministrativoOptionsQueryDto>
  ): Promise<TipoProcessoAdministrativoOptionDto[]> {
    return this.service.listOptions(ctx.query ?? {});
  }
}
