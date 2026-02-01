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
  CreateNotaVersaoDto,
  NotaVersaoDto,
  NotaVersaoErrors,
  NotaVersaoPagedResponseDto,
  NotaVersaoParamsDto,
  NotaVersaoQueryDto,
  NotaVersaoQueryDtoClass,
  ReplaceNotaVersaoDto,
  UpdateNotaVersaoDto
} from "../dtos/nota-versao/nota-versao.dtos";
import { NotaVersaoService } from "../services/nota-versao.service";

@Controller("/nota-versao")
export class NotaVersaoController {
  private readonly service = new NotaVersaoService();

  @Get("/")
  @Query(NotaVersaoQueryDtoClass)
  @Returns(NotaVersaoPagedResponseDto)
  async list(ctx: RequestContext<unknown, NotaVersaoQueryDto>): Promise<unknown> {
    return this.service.list(ctx.query ?? {});
  }

  @Get("/:id")
  @Params(NotaVersaoParamsDto)
  @Returns(NotaVersaoDto)
  @NotaVersaoErrors
  async getOne(ctx: RequestContext<unknown, undefined, NotaVersaoParamsDto>): Promise<NotaVersaoDto> {
    const id = parseIdOrThrow(ctx.params.id, "nota versao");
    return this.service.getOne(id);
  }

  @Post("/")
  @Body(CreateNotaVersaoDto)
  @Returns({ status: 201, schema: NotaVersaoDto })
  async create(ctx: RequestContext<CreateNotaVersaoDto>): Promise<NotaVersaoDto> {
    return this.service.create(ctx.body as CreateNotaVersaoDto);
  }

  @Put("/:id")
  @Params(NotaVersaoParamsDto)
  @Body(ReplaceNotaVersaoDto)
  @Returns(NotaVersaoDto)
  @NotaVersaoErrors
  async replace(
    ctx: RequestContext<ReplaceNotaVersaoDto, undefined, NotaVersaoParamsDto>
  ): Promise<NotaVersaoDto> {
    const id = parseIdOrThrow(ctx.params.id, "nota versao");
    return this.service.replace(id, ctx.body as ReplaceNotaVersaoDto);
  }

  @Patch("/:id")
  @Params(NotaVersaoParamsDto)
  @Body(UpdateNotaVersaoDto)
  @Returns(NotaVersaoDto)
  @NotaVersaoErrors
  async update(
    ctx: RequestContext<UpdateNotaVersaoDto, undefined, NotaVersaoParamsDto>
  ): Promise<NotaVersaoDto> {
    const id = parseIdOrThrow(ctx.params.id, "nota versao");
    return this.service.update(id, ctx.body as UpdateNotaVersaoDto);
  }

  @Delete("/:id")
  @Params(NotaVersaoParamsDto)
  @Returns({ status: 204 })
  @NotaVersaoErrors
  async remove(ctx: RequestContext<unknown, undefined, NotaVersaoParamsDto>): Promise<void> {
    const id = parseIdOrThrow(ctx.params.id, "nota versao");
    await this.service.remove(id);
  }
}
