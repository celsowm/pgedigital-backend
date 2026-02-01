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
  ClasseProcessualDto,
  CreateClasseProcessualDto,
  ReplaceClasseProcessualDto,
  UpdateClasseProcessualDto,
  ClasseProcessualParamsDto,
  ClasseProcessualPagedResponseDto,
  ClasseProcessualQueryDto,
  ClasseProcessualQueryDtoClass,
  ClasseProcessualErrors,
  ClasseProcessualOptionsDto,
  ClasseProcessualOptionDto
} from "../dtos/classe-processual/classe-processual.dtos";
import { ClasseProcessualService } from "../services/classe-processual.service";

@Controller("/classe-processual")
export class ClasseProcessualController {
  private readonly service = new ClasseProcessualService();

  @Get("/")
  @Query(ClasseProcessualQueryDtoClass)
  @Returns(ClasseProcessualPagedResponseDto)
  async list(ctx: RequestContext<unknown, ClasseProcessualQueryDto>): Promise<unknown> {
    return this.service.list(ctx.query ?? {});
  }

  @Get("/options")
  @Query(ClasseProcessualQueryDtoClass)
  @Returns(ClasseProcessualOptionsDto)
  async listOptions(
    ctx: RequestContext<unknown, ClasseProcessualQueryDto>
  ): Promise<ClasseProcessualOptionDto[]> {
    return this.service.listOptions(ctx.query ?? {});
  }

  @Get("/:id")
  @Params(ClasseProcessualParamsDto)
  @Returns(ClasseProcessualDto)
  @ClasseProcessualErrors
  async getOne(ctx: RequestContext<unknown, undefined, ClasseProcessualParamsDto>): Promise<ClasseProcessualDto> {
    const id = parseIdOrThrow(ctx.params.id, "classe processual");
    return this.service.getOne(id);
  }

  @Post("/")
  @Body(CreateClasseProcessualDto)
  @Returns({ status: 201, schema: ClasseProcessualDto })
  async create(ctx: RequestContext<CreateClasseProcessualDto>): Promise<ClasseProcessualDto> {
    return this.service.create(ctx.body as CreateClasseProcessualDto);
  }

  @Put("/:id")
  @Params(ClasseProcessualParamsDto)
  @Body(ReplaceClasseProcessualDto)
  @Returns(ClasseProcessualDto)
  @ClasseProcessualErrors
  async replace(
    ctx: RequestContext<ReplaceClasseProcessualDto, undefined, ClasseProcessualParamsDto>
  ): Promise<ClasseProcessualDto> {
    const id = parseIdOrThrow(ctx.params.id, "classe processual");
    return this.service.replace(id, ctx.body as ReplaceClasseProcessualDto);
  }

  @Patch("/:id")
  @Params(ClasseProcessualParamsDto)
  @Body(UpdateClasseProcessualDto)
  @Returns(ClasseProcessualDto)
  @ClasseProcessualErrors
  async update(
    ctx: RequestContext<UpdateClasseProcessualDto, undefined, ClasseProcessualParamsDto>
  ): Promise<ClasseProcessualDto> {
    const id = parseIdOrThrow(ctx.params.id, "classe processual");
    return this.service.update(id, ctx.body as UpdateClasseProcessualDto);
  }

  @Delete("/:id")
  @Params(ClasseProcessualParamsDto)
  @Returns({ status: 204 })
  @ClasseProcessualErrors
  async remove(ctx: RequestContext<unknown, undefined, ClasseProcessualParamsDto>): Promise<void> {
    const id = parseIdOrThrow(ctx.params.id, "classe processual");
    await this.service.remove(id);
  }
}
