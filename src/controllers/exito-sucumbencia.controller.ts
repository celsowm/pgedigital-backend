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
  ExitoSucumbenciaDto,
  CreateExitoSucumbenciaDto,
  ReplaceExitoSucumbenciaDto,
  UpdateExitoSucumbenciaDto,
  ExitoSucumbenciaParamsDto,
  ExitoSucumbenciaPagedResponseDto,
  ExitoSucumbenciaQueryDto,
  ExitoSucumbenciaQueryDtoClass,
  ExitoSucumbenciaOptionsQueryDto,
  ExitoSucumbenciaOptionsQueryDtoClass,
  ExitoSucumbenciaErrors,
  ExitoSucumbenciaOptionsDto,
  ExitoSucumbenciaOptionDto
} from "../dtos/exito-sucumbencia/exito-sucumbencia.dtos";
import { ExitoSucumbenciaService } from "../services/exito-sucumbencia.service";

@Controller("/exito-sucumbencia")
export class ExitoSucumbenciaController {
  private readonly service = new ExitoSucumbenciaService();

  @Get("/")
  @Query(ExitoSucumbenciaQueryDtoClass)
  @Returns(ExitoSucumbenciaPagedResponseDto)
  async list(ctx: RequestContext<unknown, ExitoSucumbenciaQueryDto>): Promise<unknown> {
    return this.service.list(ctx.query ?? {});
  }

  @Get("/options")
  @Query(ExitoSucumbenciaOptionsQueryDtoClass)
  @Returns(ExitoSucumbenciaOptionsDto)
  async listOptions(ctx: RequestContext<unknown, ExitoSucumbenciaOptionsQueryDto>): Promise<ExitoSucumbenciaOptionDto[]> {
    return this.service.listOptions(ctx.query ?? {});
  }

  @Get("/:id")
  @Params(ExitoSucumbenciaParamsDto)
  @Returns(ExitoSucumbenciaDto)
  @ExitoSucumbenciaErrors
  async getOne(ctx: RequestContext<unknown, undefined, ExitoSucumbenciaParamsDto>): Promise<ExitoSucumbenciaDto> {
    const id = parseIdOrThrow(ctx.params.id, "êxito de sucumbência");
    return this.service.getOne(id);
  }

  @Post("/")
  @Body(CreateExitoSucumbenciaDto)
  @Returns({ status: 201, schema: ExitoSucumbenciaDto })
  async create(ctx: RequestContext<CreateExitoSucumbenciaDto>): Promise<ExitoSucumbenciaDto> {
    return this.service.create(ctx.body as CreateExitoSucumbenciaDto);
  }

  @Put("/:id")
  @Params(ExitoSucumbenciaParamsDto)
  @Body(ReplaceExitoSucumbenciaDto)
  @Returns(ExitoSucumbenciaDto)
  @ExitoSucumbenciaErrors
  async replace(
    ctx: RequestContext<ReplaceExitoSucumbenciaDto, undefined, ExitoSucumbenciaParamsDto>
  ): Promise<ExitoSucumbenciaDto> {
    const id = parseIdOrThrow(ctx.params.id, "êxito de sucumbência");
    return this.service.replace(id, ctx.body as ReplaceExitoSucumbenciaDto);
  }

  @Patch("/:id")
  @Params(ExitoSucumbenciaParamsDto)
  @Body(UpdateExitoSucumbenciaDto)
  @Returns(ExitoSucumbenciaDto)
  @ExitoSucumbenciaErrors
  async update(
    ctx: RequestContext<UpdateExitoSucumbenciaDto, undefined, ExitoSucumbenciaParamsDto>
  ): Promise<ExitoSucumbenciaDto> {
    const id = parseIdOrThrow(ctx.params.id, "êxito de sucumbência");
    return this.service.update(id, ctx.body as UpdateExitoSucumbenciaDto);
  }

  @Delete("/:id")
  @Params(ExitoSucumbenciaParamsDto)
  @Returns({ status: 204 })
  @ExitoSucumbenciaErrors
  async remove(ctx: RequestContext<unknown, undefined, ExitoSucumbenciaParamsDto>): Promise<void> {
    const id = parseIdOrThrow(ctx.params.id, "êxito de sucumbência");
    await this.service.remove(id);
  }
}
