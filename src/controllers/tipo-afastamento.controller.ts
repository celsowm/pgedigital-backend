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
  TipoAfastamentoDto,
  CreateTipoAfastamentoDto,
  ReplaceTipoAfastamentoDto,
  UpdateTipoAfastamentoDto,
  TipoAfastamentoParamsDto,
  TipoAfastamentoPagedResponseDto,
  TipoAfastamentoQueryDto,
  TipoAfastamentoQueryDtoClass,
  TipoAfastamentoErrors,
  TipoAfastamentoOptionsDto,
  TipoAfastamentoOptionDto
} from "../dtos/tipo-afastamento/tipo-afastamento.dtos";
import { TipoAfastamentoService } from "../services/tipo-afastamento.service";

@Controller("/tipo-afastamento")
export class TipoAfastamentoController {
  private readonly service = new TipoAfastamentoService();

  @Get("/")
  @Query(TipoAfastamentoQueryDtoClass)
  @Returns(TipoAfastamentoPagedResponseDto)
  async list(ctx: RequestContext<unknown, TipoAfastamentoQueryDto>): Promise<unknown> {
    return this.service.list(ctx.query ?? {});
  }

  @Get("/options")
  @Query(TipoAfastamentoQueryDtoClass)
  @Returns(TipoAfastamentoOptionsDto)
  async listOptions(
    ctx: RequestContext<unknown, TipoAfastamentoQueryDto>
  ): Promise<TipoAfastamentoOptionDto[]> {
    return this.service.listOptions(ctx.query ?? {});
  }

  @Get("/:id")
  @Params(TipoAfastamentoParamsDto)
  @Returns(TipoAfastamentoDto)
  @TipoAfastamentoErrors
  async getOne(ctx: RequestContext<unknown, undefined, TipoAfastamentoParamsDto>): Promise<TipoAfastamentoDto> {
    const id = parseIdOrThrow(ctx.params.id, "tipo afastamento");
    return this.service.getOne(id);
  }

  @Post("/")
  @Body(CreateTipoAfastamentoDto)
  @Returns({ status: 201, schema: TipoAfastamentoDto })
  async create(ctx: RequestContext<CreateTipoAfastamentoDto>): Promise<TipoAfastamentoDto> {
    return this.service.create(ctx.body as CreateTipoAfastamentoDto);
  }

  @Put("/:id")
  @Params(TipoAfastamentoParamsDto)
  @Body(ReplaceTipoAfastamentoDto)
  @Returns(TipoAfastamentoDto)
  @TipoAfastamentoErrors
  async replace(
    ctx: RequestContext<ReplaceTipoAfastamentoDto, undefined, TipoAfastamentoParamsDto>
  ): Promise<TipoAfastamentoDto> {
    const id = parseIdOrThrow(ctx.params.id, "tipo afastamento");
    return this.service.replace(id, ctx.body as ReplaceTipoAfastamentoDto);
  }

  @Patch("/:id")
  @Params(TipoAfastamentoParamsDto)
  @Body(UpdateTipoAfastamentoDto)
  @Returns(TipoAfastamentoDto)
  @TipoAfastamentoErrors
  async update(
    ctx: RequestContext<UpdateTipoAfastamentoDto, undefined, TipoAfastamentoParamsDto>
  ): Promise<TipoAfastamentoDto> {
    const id = parseIdOrThrow(ctx.params.id, "tipo afastamento");
    return this.service.update(id, ctx.body as UpdateTipoAfastamentoDto);
  }

  @Delete("/:id")
  @Params(TipoAfastamentoParamsDto)
  @Returns({ status: 204 })
  @TipoAfastamentoErrors
  async remove(ctx: RequestContext<unknown, undefined, TipoAfastamentoParamsDto>): Promise<void> {
    const id = parseIdOrThrow(ctx.params.id, "tipo afastamento");
    await this.service.remove(id);
  }
}
