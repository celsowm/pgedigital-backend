import { Controller, Get, Query, Returns, type RequestContext } from "adorn-api";
import {
  TipoAudienciaOptionDto,
  TipoAudienciaOptionsDto,
  TipoAudienciaPagedResponseDto,
  TipoAudienciaQueryDto,
  TipoAudienciaQueryDtoClass,
  TipoAudienciaOptionsQueryDto,
  TipoAudienciaOptionsQueryDtoClass
} from "../dtos/tipo-audiencia/tipo-audiencia.dtos";
import { TipoAudienciaService } from "../services/tipo-audiencia.service";

@Controller("/tipo-audiencia")
export class TipoAudienciaController {
  private readonly service = new TipoAudienciaService();

  @Get("/")
  @Query(TipoAudienciaQueryDtoClass)
  @Returns(TipoAudienciaPagedResponseDto)
  async list(ctx: RequestContext<unknown, TipoAudienciaQueryDto>): Promise<unknown> {
    return this.service.list(ctx.query ?? {});
  }

  @Get("/options")
  @Query(TipoAudienciaOptionsQueryDtoClass)
  @Returns(TipoAudienciaOptionsDto)
  async listOptions(ctx: RequestContext<unknown, TipoAudienciaOptionsQueryDto>): Promise<TipoAudienciaOptionDto[]> {
    return this.service.listOptions(ctx.query ?? {});
  }
}
