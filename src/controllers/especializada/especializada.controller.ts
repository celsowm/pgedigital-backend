import {
  Body,
  Controller,
  Delete,
  Get,
  HttpError,
  Params,
  Patch,
  Post,
  Put,
  Query,
  Returns,
  applyInput,
  parseFilter,
  parseIdOrThrow,
  parsePagination,
  type RequestContext
} from "adorn-api";
import {
  applyFilter,
  entityRef,
  isNotNull,
  selectFromEntity,
  type OrmSession,
  eq
} from "metal-orm";
import { withSession } from "../../db/mssql";
import { Especializada } from "../../entities/Especializada";
import { Usuario } from "../../entities/Usuario";
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
} from "../../dtos/especializada/especializada.dtos";
import { BaseController } from "../../utils/base-controller";

const E = entityRef(Especializada);

type EspecializadaFilterFields = "nome" | "sigla";

const ESPECIALIZADA_FILTER_MAPPINGS = {
  nomeContains: { field: "nome", operator: "contains" },
  siglaContains: { field: "sigla", operator: "contains" }
} satisfies Record<
  string,
  {
    field: EspecializadaFilterFields;
    operator: "equals" | "contains";
  }
>;

type ResponsavelFilterFields = "nome";

const RESPONSAVEL_FILTER_MAPPINGS = {
  responsavelNomeContains: { field: "nome", operator: "contains" }
} satisfies Record<
  string,
  {
    field: ResponsavelFilterFields;
    operator: "equals" | "contains";
  }
>;

async function getEspecializadaWithResponsavelOrThrow(
  session: OrmSession,
  id: number
): Promise<Especializada> {
  const query = selectFromEntity(Especializada)
    .includePick("responsavel", ["id", "nome"])
    .where(eq(E.id, id));
  const [especializada] = await query.execute(session);
  if (!especializada) {
    throw new HttpError(404, "Especializada not found.");
  }
  return especializada;
}

@Controller("/especializada")
export class EspecializadaController extends BaseController<Especializada, EspecializadaFilterFields> {
  get entityClass() {
    return Especializada;
  }

  get entityRef(): any {
    return E;
  }

  get filterMappings(): Record<string, { field: EspecializadaFilterFields; operator: "equals" | "contains" }> {
    return ESPECIALIZADA_FILTER_MAPPINGS;
  }

  get entityName() {
    return "especializada";
  }
  @Get("/")
  @Query(EspecializadaQueryDtoClass)
  @Returns(EspecializadaPagedResponseDto)
  async list(ctx: RequestContext<unknown, EspecializadaQueryDto>): Promise<unknown> {
    const paginationQuery = (ctx.query ?? {}) as Record<string, unknown>;
    const responsavelFilters = parseFilter<Usuario, ResponsavelFilterFields>(
      paginationQuery,
      RESPONSAVEL_FILTER_MAPPINGS
    );

    return withSession(async (session) => {
      const { page, pageSize } = parsePagination(paginationQuery);
      const filters = parseFilter<Especializada, EspecializadaFilterFields>(
        paginationQuery,
        this.filterMappings
      );

      let query = applyFilter(
        selectFromEntity(Especializada)
          .includePick("responsavel", ["id", "nome"])
          .orderBy(E.id, "ASC"),
        Especializada,
        filters
      );

      if (responsavelFilters) {
        query = query.whereHas("responsavel", (qb) =>
          applyFilter(qb, Usuario, responsavelFilters)
        );
      }

      const paged = await query.executePaged(session, { page, pageSize });
      const { toPagedResponse } = await import("metal-orm");
      return toPagedResponse(paged);
    });
  }

  @Get("/siglas")
  @Returns(EspecializadaSiglasDto)
  async listSiglas(): Promise<string[]> {
    return withSession(async (session) => {
      return selectFromEntity(Especializada)
        .distinct(E.sigla)
        .where(isNotNull(E.sigla))
        .orderBy(E.sigla, "ASC")
        .pluck("sigla", session);
    });
  }

  @Get("/options")
  @Query(EspecializadaQueryDtoClass)
  @Returns(EspecializadaOptionsDto)
  async listOptions(ctx: RequestContext<unknown, EspecializadaQueryDto>): Promise<EspecializadaOptionDto[]> {
    return super.listOptions(ctx);
  }

  @Get("/:id")
  @Params(EspecializadaParamsDto)
  @Returns(EspecializadaWithResponsavelDto)
  @EspecializadaErrors
  async getOne(
    ctx: RequestContext<unknown, undefined, EspecializadaParamsDto>
  ): Promise<EspecializadaWithResponsavelDto> {
    return withSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "especializada");
      const especializada = await getEspecializadaWithResponsavelOrThrow(
        session,
        id
      );
      return especializada as EspecializadaWithResponsavelDto;
    });
  }

  @Post("/")
  @Body(CreateEspecializadaDto)
  @Returns({ status: 201, schema: EspecializadaWithResponsavelDto })
  async create(ctx: RequestContext<CreateEspecializadaDto>): Promise<EspecializadaWithResponsavelDto> {
    return withSession(async (session) => {
      const especializada = new Especializada();
      applyInput(especializada, ctx.body as Partial<Especializada>, { partial: false });
      await session.persist(especializada);
      await session.commit();
      return (await getEspecializadaWithResponsavelOrThrow(
        session,
        especializada.id
      )) as EspecializadaWithResponsavelDto;
    });
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
    return withSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "especializada");
      const especializada = await super.getEntityOrThrow(session, id);
      applyInput(especializada, ctx.body as Partial<Especializada>, { partial: false });
      await session.commit();
      return (await getEspecializadaWithResponsavelOrThrow(
        session,
        id
      )) as EspecializadaWithResponsavelDto;
    });
  }

  @Patch("/:id")
  @Params(EspecializadaParamsDto)
  @Body(UpdateEspecializadaDto)
  @Returns(EspecializadaWithResponsavelDto)
  @EspecializadaErrors
  async update(
    ctx: RequestContext<UpdateEspecializadaDto, undefined, EspecializadaParamsDto>
  ): Promise<EspecializadaWithResponsavelDto> {
    return withSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "especializada");
      const especializada = await super.getEntityOrThrow(session, id);
      applyInput(especializada, ctx.body as Partial<Especializada>, { partial: true });
      await session.commit();
      return (await getEspecializadaWithResponsavelOrThrow(
        session,
        id
      )) as EspecializadaWithResponsavelDto;
    });
  }

  @Delete("/:id")
  @Params(EspecializadaParamsDto)
  @Returns({ status: 204 })
  @EspecializadaErrors
  async remove(ctx: RequestContext<unknown, undefined, EspecializadaParamsDto>): Promise<void> {
    return withSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "especializada");
      await super.delete(session, id);
    });
  }
}
