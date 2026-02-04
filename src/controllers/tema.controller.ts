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
  CreateTemaDto,
  ReplaceTemaDto,
  TemaDto,
  TemaErrors,
  TemaNodeResultDto,
  TemaOptionsDto,
  TemaOptionDto,
  TemaPagedResponseDto,
  TemaParamsDto,
  TemaQueryDto,
  TemaQueryDtoClass,
  TemaWithRelationsDto,
  TemaTreeQueryDto,
  TemaTreeQueryDtoClass,
  TemaThreadedTreeSchema,
  TemaTreeListSchema,
  UpdateTemaDto
} from "../dtos/tema/tema.dtos";
import { TemaService } from "../services/tema.service";

@Controller("/tema")
export class TemaController {
  private readonly service = new TemaService();

  @Get("/")
  @Query(TemaQueryDtoClass)
  @Returns(TemaPagedResponseDto)
  async list(ctx: RequestContext<unknown, TemaQueryDto>): Promise<unknown> {
    return this.service.list(ctx.query ?? {});
  }

  @Get("/tree")
  @Query(TemaTreeQueryDtoClass)
  @Returns(TemaThreadedTreeSchema)
  async tree(ctx: RequestContext<unknown, TemaTreeQueryDto>): Promise<unknown> {
    return this.service.listTree(ctx.query ?? {});
  }

  @Get("/tree-list")
  @Query(TemaTreeQueryDtoClass)
  @Returns(TemaTreeListSchema)
  async treeList(ctx: RequestContext<unknown, TemaTreeQueryDto>): Promise<unknown> {
    return this.service.listTreeList(ctx.query ?? {});
  }

  @Get("/node/:id")
  @Params(TemaParamsDto)
  @Returns(TemaNodeResultDto)
  @TemaErrors
  async getNode(ctx: RequestContext<unknown, undefined, TemaParamsDto>): Promise<unknown> {
    const id = parseIdOrThrow(ctx.params.id, "tema");
    return this.service.getNode(id);
  }

  @Get("/options")
  @Query(TemaQueryDtoClass)
  @Returns(TemaOptionsDto)
  async listOptions(ctx: RequestContext<unknown, TemaQueryDto>): Promise<TemaOptionDto[]> {
    return this.service.listOptions(ctx.query ?? {});
  }

  @Get("/:id")
  @Params(TemaParamsDto)
  @Returns(TemaWithRelationsDto)
  @TemaErrors
  async getOne(
    ctx: RequestContext<unknown, undefined, TemaParamsDto>
  ): Promise<TemaWithRelationsDto> {
    const id = parseIdOrThrow(ctx.params.id, "tema");
    return this.service.getOne(id);
  }

  @Post("/")
  @Body(CreateTemaDto)
  @Returns({ status: 201, schema: TemaDto })
  async create(ctx: RequestContext<CreateTemaDto>): Promise<TemaDto> {
    return this.service.create(ctx.body as CreateTemaDto);
  }

  @Put("/:id")
  @Params(TemaParamsDto)
  @Body(ReplaceTemaDto)
  @Returns(TemaDto)
  @TemaErrors
  async replace(
    ctx: RequestContext<ReplaceTemaDto, undefined, TemaParamsDto>
  ): Promise<TemaDto> {
    const id = parseIdOrThrow(ctx.params.id, "tema");
    return this.service.replace(id, ctx.body as ReplaceTemaDto);
  }

  @Patch("/:id")
  @Params(TemaParamsDto)
  @Body(UpdateTemaDto)
  @Returns(TemaDto)
  @TemaErrors
  async update(
    ctx: RequestContext<UpdateTemaDto, undefined, TemaParamsDto>
  ): Promise<TemaDto> {
    const id = parseIdOrThrow(ctx.params.id, "tema");
    return this.service.update(id, ctx.body as UpdateTemaDto);
  }

  @Delete("/:id")
  @Params(TemaParamsDto)
  @Returns({ status: 204 })
  @TemaErrors
  async remove(ctx: RequestContext<unknown, undefined, TemaParamsDto>): Promise<void> {
    const id = parseIdOrThrow(ctx.params.id, "tema");
    await this.service.remove(id);
  }
}
