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
  FeriadoDto,
  CreateFeriadoDto,
  ReplaceFeriadoDto,
  UpdateFeriadoDto,
  FeriadoParamsDto,
  FeriadoPagedResponseDto,
  FeriadoQueryDto,
  FeriadoQueryDtoClass,
  FeriadoErrors,
  FeriadoOptionsDto,
  FeriadoOptionDto
} from "../dtos/feriado/feriado.dtos";
import { FeriadoService } from "../services/feriado.service";

@Controller("/feriado")
export class FeriadoController {
  private readonly service = new FeriadoService();

  @Get("/")
  @Query(FeriadoQueryDtoClass)
  @Returns(FeriadoPagedResponseDto)
  async list(ctx: RequestContext<unknown, FeriadoQueryDto>): Promise<unknown> {
    return this.service.list(ctx.query ?? {});
  }

  @Get("/options")
  @Query(FeriadoQueryDtoClass)
  @Returns(FeriadoOptionsDto)
  async listOptions(ctx: RequestContext<unknown, FeriadoQueryDto>): Promise<FeriadoOptionDto[]> {
    return this.service.listOptions(ctx.query ?? {});
  }

  @Get("/:id")
  @Params(FeriadoParamsDto)
  @Returns(FeriadoDto)
  @FeriadoErrors
  async getOne(ctx: RequestContext<unknown, undefined, FeriadoParamsDto>): Promise<FeriadoDto> {
    const id = parseIdOrThrow(ctx.params.id, "feriado");
    return this.service.getOne(id);
  }

  @Post("/")
  @Body(CreateFeriadoDto)
  @Returns({ status: 201, schema: FeriadoDto })
  async create(ctx: RequestContext<CreateFeriadoDto>): Promise<FeriadoDto> {
    return this.service.create(ctx.body as CreateFeriadoDto);
  }

  @Put("/:id")
  @Params(FeriadoParamsDto)
  @Body(ReplaceFeriadoDto)
  @Returns(FeriadoDto)
  @FeriadoErrors
  async replace(
    ctx: RequestContext<ReplaceFeriadoDto, undefined, FeriadoParamsDto>
  ): Promise<FeriadoDto> {
    const id = parseIdOrThrow(ctx.params.id, "feriado");
    return this.service.replace(id, ctx.body as ReplaceFeriadoDto);
  }

  @Patch("/:id")
  @Params(FeriadoParamsDto)
  @Body(UpdateFeriadoDto)
  @Returns(FeriadoDto)
  @FeriadoErrors
  async update(
    ctx: RequestContext<UpdateFeriadoDto, undefined, FeriadoParamsDto>
  ): Promise<FeriadoDto> {
    const id = parseIdOrThrow(ctx.params.id, "feriado");
    return this.service.update(id, ctx.body as UpdateFeriadoDto);
  }

  @Delete("/:id")
  @Params(FeriadoParamsDto)
  @Returns({ status: 204 })
  @FeriadoErrors
  async remove(ctx: RequestContext<unknown, undefined, FeriadoParamsDto>): Promise<void> {
    const id = parseIdOrThrow(ctx.params.id, "feriado");
    await this.service.remove(id);
  }
}
