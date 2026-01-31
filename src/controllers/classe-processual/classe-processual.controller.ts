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
import { withSession } from "../../db/mssql";
import { ClasseProcessual } from "../../entities/ClasseProcessual";
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
} from "../../dtos/classe-processual/classe-processual.dtos";
import { BaseController } from "../../utils/base-controller";

const ClasseProcessualRef = entityRef(ClasseProcessual);

type ClasseProcessualFilterFields = "nome";

const CLASSE_PROCESSUAL_FILTER_MAPPINGS = {
  nomeContains: { field: "nome", operator: "contains" }
} satisfies Record<string, { field: ClasseProcessualFilterFields; operator: "equals" | "contains" }>;

@Controller("/classe-processual")
export class ClasseProcessualController extends BaseController<ClasseProcessual, ClasseProcessualFilterFields> {
  get entityClass() {
    return ClasseProcessual;
  }

  get entityRef(): any {
    return ClasseProcessualRef;
  }

  get filterMappings(): Record<string, { field: ClasseProcessualFilterFields; operator: "equals" | "contains" }> {
    return CLASSE_PROCESSUAL_FILTER_MAPPINGS;
  }

  get entityName() {
    return "classe processual";
  }

  @Get("/")
  @Query(ClasseProcessualQueryDtoClass)
  @Returns(ClasseProcessualPagedResponseDto)
  async list(ctx: RequestContext<unknown, ClasseProcessualQueryDto>): Promise<unknown> {
    return super.list(ctx);
  }

  @Get("/options")
  @Query(ClasseProcessualQueryDtoClass)
  @Returns(ClasseProcessualOptionsDto)
  async listOptions(
    ctx: RequestContext<unknown, ClasseProcessualQueryDto>
  ): Promise<ClasseProcessualOptionDto[]> {
    return super.listOptions(ctx);
  }

  @Get("/:id")
  @Params(ClasseProcessualParamsDto)
  @Returns(ClasseProcessualDto)
  @ClasseProcessualErrors
  async getOne(ctx: RequestContext<unknown, undefined, ClasseProcessualParamsDto>): Promise<ClasseProcessualDto> {
    return withSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "classe processual");
      const classeProcessual = await super.getEntityOrThrow(session, id);
      return classeProcessual as ClasseProcessualDto;
    });
  }

  @Post("/")
  @Body(CreateClasseProcessualDto)
  @Returns({ status: 201, schema: ClasseProcessualDto })
  async create(ctx: RequestContext<CreateClasseProcessualDto>): Promise<ClasseProcessualDto> {
    return withSession(async (session) => {
      const classeProcessual = new ClasseProcessual();
      applyInput(classeProcessual, ctx.body as Partial<ClasseProcessual>, { partial: false });
      await session.persist(classeProcessual);
      await session.commit();
      return classeProcessual as ClasseProcessualDto;
    });
  }

  @Put("/:id")
  @Params(ClasseProcessualParamsDto)
  @Body(ReplaceClasseProcessualDto)
  @Returns(ClasseProcessualDto)
  @ClasseProcessualErrors
  async replace(
    ctx: RequestContext<ReplaceClasseProcessualDto, undefined, ClasseProcessualParamsDto>
  ): Promise<ClasseProcessualDto> {
    return withSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "classe processual");
      const classeProcessual = await super.getEntityOrThrow(session, id);
      applyInput(classeProcessual, ctx.body as Partial<ClasseProcessual>, { partial: false });
      await session.commit();
      return classeProcessual as ClasseProcessualDto;
    });
  }

  @Patch("/:id")
  @Params(ClasseProcessualParamsDto)
  @Body(UpdateClasseProcessualDto)
  @Returns(ClasseProcessualDto)
  @ClasseProcessualErrors
  async update(
    ctx: RequestContext<UpdateClasseProcessualDto, undefined, ClasseProcessualParamsDto>
  ): Promise<ClasseProcessualDto> {
    return withSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "classe processual");
      const classeProcessual = await super.getEntityOrThrow(session, id);
      applyInput(classeProcessual, ctx.body as Partial<ClasseProcessual>, { partial: true });
      await session.commit();
      return classeProcessual as ClasseProcessualDto;
    });
  }

  @Delete("/:id")
  @Params(ClasseProcessualParamsDto)
  @Returns({ status: 204 })
  @ClasseProcessualErrors
  async remove(ctx: RequestContext<unknown, undefined, ClasseProcessualParamsDto>): Promise<void> {
    return withSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "classe processual");
      await super.delete(session, id);
    });
  }
}
