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
  NaturezaIncidenteDto,
  CreateNaturezaIncidenteDto,
  ReplaceNaturezaIncidenteDto,
  UpdateNaturezaIncidenteDto,
  NaturezaIncidenteParamsDto,
  NaturezaIncidentePagedResponseDto,
  NaturezaIncidenteQueryDto,
  NaturezaIncidenteQueryDtoClass,
  NaturezaIncidenteErrors,
  NaturezaIncidenteOptionsDto,
  NaturezaIncidenteOptionDto
} from "../dtos/natureza-incidente/natureza-incidente.dtos";
import { NaturezaIncidenteService } from "../services/natureza-incidente.service";

@Controller("/natureza-incidente")
export class NaturezaIncidenteController {
  private readonly service = new NaturezaIncidenteService();

  @Get("/")
  @Query(NaturezaIncidenteQueryDtoClass)
  @Returns(NaturezaIncidentePagedResponseDto)
  async list(ctx: RequestContext<unknown, NaturezaIncidenteQueryDto>): Promise<unknown> {
    return this.service.list(ctx.query ?? {});
  }

  @Get("/options")
  @Query(NaturezaIncidenteQueryDtoClass)
  @Returns(NaturezaIncidenteOptionsDto)
  async listOptions(
    ctx: RequestContext<unknown, NaturezaIncidenteQueryDto>
  ): Promise<NaturezaIncidenteOptionDto[]> {
    return this.service.listOptions(ctx.query ?? {});
  }

  @Get("/:id")
  @Params(NaturezaIncidenteParamsDto)
  @Returns(NaturezaIncidenteDto)
  @NaturezaIncidenteErrors
  async getOne(ctx: RequestContext<unknown, undefined, NaturezaIncidenteParamsDto>): Promise<NaturezaIncidenteDto> {
    const id = parseIdOrThrow(ctx.params.id, "natureza incidente");
    return this.service.getOne(id);
  }

  @Post("/")
  @Body(CreateNaturezaIncidenteDto)
  @Returns({ status: 201, schema: NaturezaIncidenteDto })
  async create(ctx: RequestContext<CreateNaturezaIncidenteDto>): Promise<NaturezaIncidenteDto> {
    return this.service.create(ctx.body as CreateNaturezaIncidenteDto);
  }

  @Put("/:id")
  @Params(NaturezaIncidenteParamsDto)
  @Body(ReplaceNaturezaIncidenteDto)
  @Returns(NaturezaIncidenteDto)
  @NaturezaIncidenteErrors
  async replace(
    ctx: RequestContext<ReplaceNaturezaIncidenteDto, undefined, NaturezaIncidenteParamsDto>
  ): Promise<NaturezaIncidenteDto> {
    const id = parseIdOrThrow(ctx.params.id, "natureza incidente");
    return this.service.replace(id, ctx.body as ReplaceNaturezaIncidenteDto);
  }

  @Patch("/:id")
  @Params(NaturezaIncidenteParamsDto)
  @Body(UpdateNaturezaIncidenteDto)
  @Returns(NaturezaIncidenteDto)
  @NaturezaIncidenteErrors
  async update(
    ctx: RequestContext<UpdateNaturezaIncidenteDto, undefined, NaturezaIncidenteParamsDto>
  ): Promise<NaturezaIncidenteDto> {
    const id = parseIdOrThrow(ctx.params.id, "natureza incidente");
    return this.service.update(id, ctx.body as UpdateNaturezaIncidenteDto);
  }

  @Delete("/:id")
  @Params(NaturezaIncidenteParamsDto)
  @Returns({ status: 204 })
  @NaturezaIncidenteErrors
  async remove(ctx: RequestContext<unknown, undefined, NaturezaIncidenteParamsDto>): Promise<void> {
    const id = parseIdOrThrow(ctx.params.id, "natureza incidente");
    await this.service.remove(id);
  }
}
