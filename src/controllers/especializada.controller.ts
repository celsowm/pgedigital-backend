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
  CreateEspecializadaDto,
  EspecializadaErrors,
  EspecializadaPagedResponseDto,
  EspecializadaParamsDto,
  EspecializadaQueryDto,
  EspecializadaQueryDtoClass,
  EspecializadaOptionsDto,
  EspecializadaSiglasDto,
  EspecializadaWithResponsavelDto,
  EspecializadaOptionDto,
  ReplaceEspecializadaDto,
  UpdateEspecializadaDto
} from "../dtos/especializada/especializada.dtos";
import { EspecializadaService } from "../services/especializada.service";

@Controller("/especializada")
export class EspecializadaController {
  private readonly service = new EspecializadaService();

  @Get("/")
  @Query(EspecializadaQueryDtoClass)
  @Returns(EspecializadaPagedResponseDto)
  async list(ctx: RequestContext<unknown, EspecializadaQueryDto>): Promise<unknown> {
    return this.service.list(ctx.query ?? {});
  }

  @Get("/siglas")
  @Returns(EspecializadaSiglasDto)
  async listSiglas(): Promise<string[]> {
    return this.service.listSiglas();
  }

  @Get("/options")
  @Query(EspecializadaQueryDtoClass)
  @Returns(EspecializadaOptionsDto)
  async listOptions(ctx: RequestContext<unknown, EspecializadaQueryDto>): Promise<EspecializadaOptionDto[]> {
    return this.service.listOptions(ctx.query ?? {});
  }

  @Get("/:id")
  @Params(EspecializadaParamsDto)
  @Returns(EspecializadaWithResponsavelDto)
  @EspecializadaErrors
  async getOne(
    ctx: RequestContext<unknown, undefined, EspecializadaParamsDto>
  ): Promise<EspecializadaWithResponsavelDto> {
    const id = parseIdOrThrow(ctx.params.id, "especializada");
    return this.service.getOne(id);
  }

  @Post("/")
  @Body(CreateEspecializadaDto)
  @Returns({ status: 201, schema: EspecializadaWithResponsavelDto })
  async create(ctx: RequestContext<CreateEspecializadaDto>): Promise<EspecializadaWithResponsavelDto> {
    return this.service.create(ctx.body as CreateEspecializadaDto);
  }

  @Put("/:id")
  @Params(EspecializadaParamsDto)
  @Body(ReplaceEspecializadaDto)
  @Returns(EspecializadaWithResponsavelDto)
  @EspecializadaErrors
  async replace(
    ctx: RequestContext<
      ReplaceEspecializadaDto,
      undefined,
      EspecializadaParamsDto
    >
  ): Promise<EspecializadaWithResponsavelDto> {
    const id = parseIdOrThrow(ctx.params.id, "especializada");
    return this.service.replace(id, ctx.body as ReplaceEspecializadaDto);
  }

  @Patch("/:id")
  @Params(EspecializadaParamsDto)
  @Body(UpdateEspecializadaDto)
  @Returns(EspecializadaWithResponsavelDto)
  @EspecializadaErrors
  async update(
    ctx: RequestContext<UpdateEspecializadaDto, undefined, EspecializadaParamsDto>
  ): Promise<EspecializadaWithResponsavelDto> {
    const id = parseIdOrThrow(ctx.params.id, "especializada");
    return this.service.update(id, ctx.body as UpdateEspecializadaDto);
  }

  @Delete("/:id")
  @Params(EspecializadaParamsDto)
  @Returns({ status: 204 })
  @EspecializadaErrors
  async remove(ctx: RequestContext<unknown, undefined, EspecializadaParamsDto>): Promise<void> {
    const id = parseIdOrThrow(ctx.params.id, "especializada");
    await this.service.remove(id);
  }
}
