import { Controller, Get, Query, Returns, type RequestContext } from "adorn-api";
import {
  TipoProcessoAdministrativoOptionDto,
  TipoProcessoAdministrativoQueryDto,
  TipoProcessoAdministrativoQueryDtoClass,
  TipoProcessoAdministrativoOptionsDto
} from "../dtos/tipo-processo-administrativo/tipo-processo-administrativo.dtos";
import { TipoProcessoAdministrativoService } from "../services/tipo-processo-administrativo.service";

@Controller("/tipo-processo-administrativo")
export class TipoProcessoAdministrativoController {
  private readonly service = new TipoProcessoAdministrativoService();

  @Get("/options")
  @Query(TipoProcessoAdministrativoQueryDtoClass)
  @Returns(TipoProcessoAdministrativoOptionsDto)
  async listOptions(
    ctx: RequestContext<unknown, TipoProcessoAdministrativoQueryDto>
  ): Promise<TipoProcessoAdministrativoOptionDto[]> {
    return this.service.listOptions(ctx.query ?? {});
  }
}
