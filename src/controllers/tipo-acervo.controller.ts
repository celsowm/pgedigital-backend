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
  TipoAcervoDto,
  CreateTipoAcervoDto,
  ReplaceTipoAcervoDto,
  UpdateTipoAcervoDto,
  TipoAcervoParamsDto,
  TipoAcervoPagedResponseDto,
  TipoAcervoQueryDto,
  TipoAcervoQueryDtoClass,
  TipoAcervoOptionsQueryDto,
  TipoAcervoOptionsQueryDtoClass,
  TipoAcervoErrors,
  TipoAcervoOptionsDto,
  TipoAcervoOptionDto
} from "../dtos/tipo-acervo/tipo-acervo.dtos";
import { TipoAcervoService } from "../services/tipo-acervo.service";

@Controller("/tipo-acervo")
export class TipoAcervoController {
  private readonly service = new TipoAcervoService();

  @Get("/")
  @Query(TipoAcervoQueryDtoClass)
  @Returns(TipoAcervoPagedResponseDto)
  async list(ctx: RequestContext<unknown, TipoAcervoQueryDto>): Promise<unknown> {
    return this.service.list(ctx.query ?? {});
  }

  @Get("/options")
  @Query(TipoAcervoOptionsQueryDtoClass)
  @Returns(TipoAcervoOptionsDto)
  async listOptions(ctx: RequestContext<unknown, TipoAcervoOptionsQueryDto>): Promise<TipoAcervoOptionDto[]> {
    return this.service.listOptions(ctx.query ?? {});
  }

  @Get("/:id")
  @Params(TipoAcervoParamsDto)
  @Returns(TipoAcervoDto)
  @TipoAcervoErrors
  async getOne(ctx: RequestContext<unknown, undefined, TipoAcervoParamsDto>): Promise<TipoAcervoDto> {
    const id = parseIdOrThrow(ctx.params.id, "tipo acervo");
    return this.service.getOne(id);
  }

  @Post("/")
  @Body(CreateTipoAcervoDto)
  @Returns({ status: 201, schema: TipoAcervoDto })
  async create(ctx: RequestContext<CreateTipoAcervoDto>): Promise<TipoAcervoDto> {
    return this.service.create(ctx.body as CreateTipoAcervoDto);
  }

  @Put("/:id")
  @Params(TipoAcervoParamsDto)
  @Body(ReplaceTipoAcervoDto)
  @Returns(TipoAcervoDto)
  @TipoAcervoErrors
  async replace(
    ctx: RequestContext<ReplaceTipoAcervoDto, undefined, TipoAcervoParamsDto>
  ): Promise<TipoAcervoDto> {
    const id = parseIdOrThrow(ctx.params.id, "tipo acervo");
    return this.service.replace(id, ctx.body as ReplaceTipoAcervoDto);
  }

  @Patch("/:id")
  @Params(TipoAcervoParamsDto)
  @Body(UpdateTipoAcervoDto)
  @Returns(TipoAcervoDto)
  @TipoAcervoErrors
  async update(
    ctx: RequestContext<UpdateTipoAcervoDto, undefined, TipoAcervoParamsDto>
  ): Promise<TipoAcervoDto> {
    const id = parseIdOrThrow(ctx.params.id, "tipo acervo");
    return this.service.update(id, ctx.body as UpdateTipoAcervoDto);
  }

  @Delete("/:id")
  @Params(TipoAcervoParamsDto)
  @Returns({ status: 204 })
  @TipoAcervoErrors
  async remove(ctx: RequestContext<unknown, undefined, TipoAcervoParamsDto>): Promise<void> {
    const id = parseIdOrThrow(ctx.params.id, "tipo acervo");
    await this.service.remove(id);
  }
}
