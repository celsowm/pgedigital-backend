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
  MateriaDto,
  CreateMateriaDto,
  ReplaceMateriaDto,
  UpdateMateriaDto,
  MateriaParamsDto,
  MateriaPagedResponseDto,
  MateriaQueryDto,
  MateriaQueryDtoClass,
  MateriaOptionsQueryDto,
  MateriaOptionsQueryDtoClass,
  MateriaErrors,
  MateriaOptionsDto,
  MateriaOptionDto
} from "../dtos/materia/materia.dtos";
import { MateriaService } from "../services/materia.service";

@Controller("/materia")
export class MateriaController {
  private readonly service = new MateriaService();

  @Get("/")
  @Query(MateriaQueryDtoClass)
  @Returns(MateriaPagedResponseDto)
  async list(ctx: RequestContext<unknown, MateriaQueryDto>): Promise<unknown> {
    return this.service.list(ctx.query ?? {});
  }

  @Get("/options")
  @Query(MateriaOptionsQueryDtoClass)
  @Returns(MateriaOptionsDto)
  async listOptions(ctx: RequestContext<unknown, MateriaOptionsQueryDto>): Promise<MateriaOptionDto[]> {
    return this.service.listOptions(ctx.query ?? {});
  }

  @Get("/:id")
  @Params(MateriaParamsDto)
  @Returns(MateriaDto)
  @MateriaErrors
  async getOne(ctx: RequestContext<unknown, undefined, MateriaParamsDto>): Promise<MateriaDto> {
    const id = parseIdOrThrow(ctx.params.id, "matéria");
    return this.service.getOne(id);
  }

  @Post("/")
  @Body(CreateMateriaDto)
  @Returns({ status: 201, schema: MateriaDto })
  async create(ctx: RequestContext<CreateMateriaDto>): Promise<MateriaDto> {
    return this.service.create(ctx.body as CreateMateriaDto);
  }

  @Put("/:id")
  @Params(MateriaParamsDto)
  @Body(ReplaceMateriaDto)
  @Returns(MateriaDto)
  @MateriaErrors
  async replace(
    ctx: RequestContext<ReplaceMateriaDto, undefined, MateriaParamsDto>
  ): Promise<MateriaDto> {
    const id = parseIdOrThrow(ctx.params.id, "matéria");
    return this.service.replace(id, ctx.body as ReplaceMateriaDto);
  }

  @Patch("/:id")
  @Params(MateriaParamsDto)
  @Body(UpdateMateriaDto)
  @Returns(MateriaDto)
  @MateriaErrors
  async update(
    ctx: RequestContext<UpdateMateriaDto, undefined, MateriaParamsDto>
  ): Promise<MateriaDto> {
    const id = parseIdOrThrow(ctx.params.id, "matéria");
    return this.service.update(id, ctx.body as UpdateMateriaDto);
  }

  @Delete("/:id")
  @Params(MateriaParamsDto)
  @Returns({ status: 204 })
  @MateriaErrors
  async remove(ctx: RequestContext<unknown, undefined, MateriaParamsDto>): Promise<void> {
    const id = parseIdOrThrow(ctx.params.id, "matéria");
    await this.service.remove(id);
  }
}
