import {
  Controller,
  Get,
  Params,
  Query,
  Returns,
  parseIdOrThrow,
  type RequestContext
} from "adorn-api";
import {
  ProcessoAdministrativoErrors,
  ProcessoAdministrativoPagedResponseDto,
  ProcessoAdministrativoQueryDto,
  ProcessoAdministrativoQueryDtoClass,
  ProcessoAdministrativoDto,
  ProcessoAdministrativoParamsDto
} from "../dtos/processo-administrativo/processo-administrativo.dtos";
import { ProcessoAdministrativoService } from "../services/processo-administrativo.service";

@Controller("/processo-administrativo")
export class ProcessoAdministrativoController {
  private readonly service = new ProcessoAdministrativoService();

  @Get("/")
  @Query(ProcessoAdministrativoQueryDtoClass)
  @Returns(ProcessoAdministrativoPagedResponseDto)
  async list(ctx: RequestContext<unknown, ProcessoAdministrativoQueryDto>): Promise<unknown> {
    return this.service.list(ctx.query ?? {});
  }

  @Get("/:id")
  @Params(ProcessoAdministrativoParamsDto)
  @Returns(ProcessoAdministrativoDto)
  @ProcessoAdministrativoErrors
  async getOne(ctx: RequestContext<unknown, undefined, ProcessoAdministrativoParamsDto>): Promise<ProcessoAdministrativoDto> {
    const id = parseIdOrThrow(ctx.params.id, "processo administrativo");
    return this.service.getOne(id);
  }
}
