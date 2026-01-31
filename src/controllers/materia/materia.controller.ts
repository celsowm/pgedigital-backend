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
import { Materia } from "../../entities/Materia";
import {
  MateriaDto,
  CreateMateriaDto,
  ReplaceMateriaDto,
  UpdateMateriaDto,
  MateriaParamsDto,
  MateriaPagedResponseDto,
  MateriaQueryDto,
  MateriaQueryDtoClass,
  MateriaErrors,
  MateriaOptionsDto,
  MateriaOptionDto
} from "../../dtos/materia/materia.dtos";
import { BaseController } from "../../utils/base-controller";

const MateriaRef = entityRef(Materia);

type MateriaFilterFields = "nome";

const MATERIA_FILTER_MAPPINGS = {
  nomeContains: { field: "nome", operator: "contains" }
} satisfies Record<string, { field: MateriaFilterFields; operator: "equals" | "contains" }>;

@Controller("/materia")
export class MateriaController extends BaseController<Materia, MateriaFilterFields> {
  get entityClass() {
    return Materia;
  }

  get entityRef(): any {
    return MateriaRef;
  }

  get filterMappings(): Record<string, { field: MateriaFilterFields; operator: "equals" | "contains" }> {
    return MATERIA_FILTER_MAPPINGS;
  }

  get entityName() {
    return "matéria";
  }

  @Get("/")
  @Query(MateriaQueryDtoClass)
  @Returns(MateriaPagedResponseDto)
  async list(ctx: RequestContext<unknown, MateriaQueryDto>): Promise<unknown> {
    return super.list(ctx);
  }

  @Get("/options")
  @Returns(MateriaOptionsDto)
  async listOptions(): Promise<MateriaOptionDto[]> {
    return super.listOptions();
  }

  @Get("/:id")
  @Params(MateriaParamsDto)
  @Returns(MateriaDto)
  @MateriaErrors
  async getOne(ctx: RequestContext<unknown, undefined, MateriaParamsDto>): Promise<MateriaDto> {
    return withSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "matéria");
      const materia = await super.getEntityOrThrow(session, id);
      return materia as MateriaDto;
    });
  }

  @Post("/")
  @Body(CreateMateriaDto)
  @Returns({ status: 201, schema: MateriaDto })
  async create(ctx: RequestContext<CreateMateriaDto>): Promise<MateriaDto> {
    return withSession(async (session) => {
      const materia = new Materia();
      applyInput(materia, ctx.body as Partial<Materia>, { partial: false });
      await session.persist(materia);
      await session.commit();
      return materia as MateriaDto;
    });
  }

  @Put("/:id")
  @Params(MateriaParamsDto)
  @Body(ReplaceMateriaDto)
  @Returns(MateriaDto)
  @MateriaErrors
  async replace(
    ctx: RequestContext<ReplaceMateriaDto, undefined, MateriaParamsDto>
  ): Promise<MateriaDto> {
    return withSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "matéria");
      const materia = await super.getEntityOrThrow(session, id);
      applyInput(materia, ctx.body as Partial<Materia>, { partial: false });
      await session.commit();
      return materia as MateriaDto;
    });
  }

  @Patch("/:id")
  @Params(MateriaParamsDto)
  @Body(UpdateMateriaDto)
  @Returns(MateriaDto)
  @MateriaErrors
  async update(
    ctx: RequestContext<UpdateMateriaDto, undefined, MateriaParamsDto>
  ): Promise<MateriaDto> {
    return withSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "matéria");
      const materia = await super.getEntityOrThrow(session, id);
      applyInput(materia, ctx.body as Partial<Materia>, { partial: true });
      await session.commit();
      return materia as MateriaDto;
    });
  }

  @Delete("/:id")
  @Params(MateriaParamsDto)
  @Returns({ status: 204 })
  @MateriaErrors
  async remove(ctx: RequestContext<unknown, undefined, MateriaParamsDto>): Promise<void> {
    return withSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "matéria");
      await super.delete(session, id);
    });
  }
}
