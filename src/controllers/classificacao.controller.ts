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
  applyInput,
  parseIdOrThrow,
  type RequestContext
} from "adorn-api";
import { entityRef } from "metal-orm";
import { withSession } from "../db/mssql";
import { Classificacao } from "../entities/Classificacao";
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
import { BaseController } from "../utils/base-controller";

const ClassificacaoRef = entityRef(Classificacao);

type ClassificacaoFilterFields = "nome";

const CLASSIFICACAO_FILTER_MAPPINGS = {
  nomeContains: { field: "nome", operator: "contains" }
} satisfies Record<string, { field: ClassificacaoFilterFields; operator: "equals" | "contains" }>;

@Controller("/classificacao")
export class ClassificacaoController extends BaseController<Classificacao, ClassificacaoFilterFields> {
  get entityClass() {
    return Classificacao;
  }

  get entityRef(): any {
    return ClassificacaoRef;
  }

  get filterMappings(): Record<string, { field: ClassificacaoFilterFields; operator: "equals" | "contains" }> {
    return CLASSIFICACAO_FILTER_MAPPINGS;
  }

  get entityName() {
    return "classificação";
  }

  @Get("/")
  @Query(ClassificacaoQueryDtoClass)
  @Returns(ClassificacaoPagedResponseDto)
  async list(ctx: RequestContext<unknown, ClassificacaoQueryDto>): Promise<unknown> {
    return super.list(ctx);
  }

  @Get("/options")
  @Query(ClassificacaoQueryDtoClass)
  @Returns(ClassificacaoOptionsDto)
  async listOptions(ctx: RequestContext<unknown, ClassificacaoQueryDto>): Promise<ClassificacaoOptionDto[]> {
    return super.listOptions(ctx);
  }

  @Get("/:id")
  @Params(ClassificacaoParamsDto)
  @Returns(ClassificacaoDto)
  @ClassificacaoErrors
  async getOne(ctx: RequestContext<unknown, undefined, ClassificacaoParamsDto>): Promise<ClassificacaoDto> {
    return withSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "classificação");
      const classificacao = await super.getEntityOrThrow(session, id);
      return classificacao as ClassificacaoDto;
    });
  }

  @Post("/")
  @Body(CreateClassificacaoDto)
  @Returns({ status: 201, schema: ClassificacaoDto })
  async create(ctx: RequestContext<CreateClassificacaoDto>): Promise<ClassificacaoDto> {
    return withSession(async (session) => {
      const classificacao = new Classificacao();
      applyInput(classificacao, ctx.body as Partial<Classificacao>, { partial: false });
      await session.persist(classificacao);
      await session.commit();
      return classificacao as ClassificacaoDto;
    });
  }

  @Put("/:id")
  @Params(ClassificacaoParamsDto)
  @Body(ReplaceClassificacaoDto)
  @Returns(ClassificacaoDto)
  @ClassificacaoErrors
  async replace(
    ctx: RequestContext<ReplaceClassificacaoDto, undefined, ClassificacaoParamsDto>
  ): Promise<ClassificacaoDto> {
    return withSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "classificação");
      const classificacao = await super.getEntityOrThrow(session, id);
      applyInput(classificacao, ctx.body as Partial<Classificacao>, { partial: false });
      await session.commit();
      return classificacao as ClassificacaoDto;
    });
  }

  @Patch("/:id")
  @Params(ClassificacaoParamsDto)
  @Body(UpdateClassificacaoDto)
  @Returns(ClassificacaoDto)
  @ClassificacaoErrors
  async update(
    ctx: RequestContext<UpdateClassificacaoDto, undefined, ClassificacaoParamsDto>
  ): Promise<ClassificacaoDto> {
    return withSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "classificação");
      const classificacao = await super.getEntityOrThrow(session, id);
      applyInput(classificacao, ctx.body as Partial<Classificacao>, { partial: true });
      await session.commit();
      return classificacao as ClassificacaoDto;
    });
  }

  @Delete("/:id")
  @Params(ClassificacaoParamsDto)
  @Returns({ status: 204 })
  @ClassificacaoErrors
  async remove(ctx: RequestContext<unknown, undefined, ClassificacaoParamsDto>): Promise<void> {
    return withSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "classificação");
      await super.delete(session, id);
    });
  }
}
