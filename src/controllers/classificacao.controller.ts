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
  ClassificacaoDto,
  CreateClassificacaoDto,
  ReplaceClassificacaoDto,
  UpdateClassificacaoDto,
  ClassificacaoParamsDto,
  ClassificacaoPagedResponseDto,
  ClassificacaoQueryDto,
  ClassificacaoQueryDtoClass,
  ClassificacaoErrors,
  ClassificacaoOptionsDto,
  ClassificacaoOptionDto
} from "../dtos/classificacao/classificacao.dtos";
import { ClassificacaoService } from "../services/classificacao.service";

@Controller("/classificacao")
export class ClassificacaoController {
  private readonly service = new ClassificacaoService();

  @Get("/")
  @Query(ClassificacaoQueryDtoClass)
  @Returns(ClassificacaoPagedResponseDto)
  async list(ctx: RequestContext<unknown, ClassificacaoQueryDto>): Promise<unknown> {
    return this.service.list(ctx.query ?? {});
  }

  @Get("/options")
  @Query(ClassificacaoQueryDtoClass)
  @Returns(ClassificacaoOptionsDto)
  async listOptions(ctx: RequestContext<unknown, ClassificacaoQueryDto>): Promise<ClassificacaoOptionDto[]> {
    return this.service.listOptions(ctx.query ?? {});
  }

  @Get("/:id")
  @Params(ClassificacaoParamsDto)
  @Returns(ClassificacaoDto)
  @ClassificacaoErrors
  async getOne(ctx: RequestContext<unknown, undefined, ClassificacaoParamsDto>): Promise<ClassificacaoDto> {
    const id = parseIdOrThrow(ctx.params.id, "classificação");
    return this.service.getOne(id);
  }

  @Post("/")
  @Body(CreateClassificacaoDto)
  @Returns({ status: 201, schema: ClassificacaoDto })
  async create(ctx: RequestContext<CreateClassificacaoDto>): Promise<ClassificacaoDto> {
    return this.service.create(ctx.body as CreateClassificacaoDto);
  }

  @Put("/:id")
  @Params(ClassificacaoParamsDto)
  @Body(ReplaceClassificacaoDto)
  @Returns(ClassificacaoDto)
  @ClassificacaoErrors
  async replace(
    ctx: RequestContext<ReplaceClassificacaoDto, undefined, ClassificacaoParamsDto>
  ): Promise<ClassificacaoDto> {
    const id = parseIdOrThrow(ctx.params.id, "classificação");
    return this.service.replace(id, ctx.body as ReplaceClassificacaoDto);
  }

  @Patch("/:id")
  @Params(ClassificacaoParamsDto)
  @Body(UpdateClassificacaoDto)
  @Returns(ClassificacaoDto)
  @ClassificacaoErrors
  async update(
    ctx: RequestContext<UpdateClassificacaoDto, undefined, ClassificacaoParamsDto>
  ): Promise<ClassificacaoDto> {
    const id = parseIdOrThrow(ctx.params.id, "classificação");
    return this.service.update(id, ctx.body as UpdateClassificacaoDto);
  }

  @Delete("/:id")
  @Params(ClassificacaoParamsDto)
  @Returns({ status: 204 })
  @ClassificacaoErrors
  async remove(ctx: RequestContext<unknown, undefined, ClassificacaoParamsDto>): Promise<void> {
    const id = parseIdOrThrow(ctx.params.id, "classificação");
    await this.service.remove(id);
  }
}
