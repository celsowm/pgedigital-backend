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
  CreateEquipeDto,
  EquipeErrors,
  EquipePagedResponseDto,
  EquipeParamsDto,
  EquipeQueryDto,
  EquipeQueryDtoClass,
  EquipeOptionsDto,
  EquipeWithEspecializadaDto,
  EquipeOptionDto,
  ReplaceEquipeDto,
  UpdateEquipeDto
} from "../dtos/equipe/equipe.dtos";
import { EquipeService } from "../services/equipe.service";

@Controller("/equipe")
export class EquipeController {
  private readonly service = new EquipeService();

  @Get("/")
  @Query(EquipeQueryDtoClass)
  @Returns(EquipePagedResponseDto)
  async list(ctx: RequestContext<unknown, EquipeQueryDto>): Promise<unknown> {
    return this.service.list(ctx.query ?? {});
  }

  @Get("/options")
  @Query(EquipeQueryDtoClass)
  @Returns(EquipeOptionsDto)
  async listOptions(ctx: RequestContext<unknown, EquipeQueryDto>): Promise<EquipeOptionDto[]> {
    return this.service.listOptions(ctx.query ?? {});
  }

  @Get("/:id")
  @Params(EquipeParamsDto)
  @Returns(EquipeWithEspecializadaDto)
  @EquipeErrors
  async getOne(
    ctx: RequestContext<unknown, undefined, EquipeParamsDto>
  ): Promise<EquipeWithEspecializadaDto> {
    const id = parseIdOrThrow(ctx.params.id, "equipe");
    return this.service.getOne(id);
  }

  @Post("/")
  @Body(CreateEquipeDto)
  @Returns({ status: 201, schema: EquipeWithEspecializadaDto })
  async create(ctx: RequestContext<CreateEquipeDto>): Promise<EquipeWithEspecializadaDto> {
    return this.service.create(ctx.body as CreateEquipeDto);
  }

  @Put("/:id")
  @Params(EquipeParamsDto)
  @Body(ReplaceEquipeDto)
  @Returns(EquipeWithEspecializadaDto)
  @EquipeErrors
  async replace(
    ctx: RequestContext<
      ReplaceEquipeDto,
      undefined,
      EquipeParamsDto
    >
  ): Promise<EquipeWithEspecializadaDto> {
    const id = parseIdOrThrow(ctx.params.id, "equipe");
    return this.service.replace(id, ctx.body as ReplaceEquipeDto);
  }

  @Patch("/:id")
  @Params(EquipeParamsDto)
  @Body(UpdateEquipeDto)
  @Returns(EquipeWithEspecializadaDto)
  @EquipeErrors
  async update(
    ctx: RequestContext<UpdateEquipeDto, undefined, EquipeParamsDto>
  ): Promise<EquipeWithEspecializadaDto> {
    const id = parseIdOrThrow(ctx.params.id, "equipe");
    return this.service.update(id, ctx.body as UpdateEquipeDto);
  }

  @Delete("/:id")
  @Params(EquipeParamsDto)
  @Returns({ status: 204 })
  @EquipeErrors
  async remove(ctx: RequestContext<unknown, undefined, EquipeParamsDto>): Promise<void> {
    const id = parseIdOrThrow(ctx.params.id, "equipe");
    await this.service.remove(id);
  }
}
