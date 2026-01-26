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
  toPagedResponse,
  type OrmSession,
  eq
} from "metal-orm";
import { withMssqlSession } from "../../db/mssql";
import { Especializada } from "../../entities/Especializada";
import { Usuario } from "../../entities/Usuario";
import {
  CreateEspecializadaDto,
  EspecializadaErrors,
  EspecializadaPagedResponseDto,
  EspecializadaParamsDto,
  EspecializadaQueryDto,
  EspecializadaQueryDtoClass,
  EspecializadaSiglasDto,
  EspecializadaWithResponsavelDto,
  ReplaceEspecializadaDto,
  UpdateEspecializadaDto
} from "../../dtos/especializada/especializada.dtos";

const especializadaRef = entityRef(Especializada);

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

type EspecializadaInput =
  | CreateEspecializadaDto
  | ReplaceEspecializadaDto
  | UpdateEspecializadaDto;

async function getEspecializadaEntityOrThrow(
  session: OrmSession,
  id: number
): Promise<Especializada> {
  const especializada = await session.find(Especializada, id);
  if (!especializada) {
    throw new HttpError(404, "Especializada not found.");
  }
  return especializada;
}

async function getEspecializadaWithResponsavelOrThrow(
  session: OrmSession,
  id: number
): Promise<Especializada> {
  const query = selectFromEntity(Especializada)
    .includePick("responsavel", ["id", "nome"])
    .where(eq(especializadaRef.id, id));
  const [especializada] = await query.execute(session);
  if (!especializada) {
    throw new HttpError(404, "Especializada not found.");
  }
  return especializada;
}

function compactUpdates<T extends Record<string, unknown>>(updates: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(updates).filter(([, value]) => value !== undefined)
  ) as Partial<T>;
}

function applyEspecializadaInput(
  entity: Especializada,
  input: EspecializadaInput,
  options: { partial: boolean }
) {
  const payload = options.partial ? compactUpdates(input) : input;
  Object.assign(entity, payload);
}

function applyEspecializadaMutation(
  entity: Especializada,
  input: CreateEspecializadaDto | ReplaceEspecializadaDto
) {
  applyEspecializadaInput(entity, input, { partial: false });
}

function applyEspecializadaPatch(entity: Especializada, input: UpdateEspecializadaDto) {
  applyEspecializadaInput(entity, input, { partial: true });
}

@Controller("/especializada")
export class EspecializadaController {
  @Get("/")
  @Query(EspecializadaQueryDtoClass)
  @Returns(EspecializadaPagedResponseDto)
  async list(ctx: RequestContext<unknown, EspecializadaQueryDto>) {
    const paginationQuery = (ctx.query ?? {}) as Record<string, unknown>;
    const { page, pageSize } = parsePagination(paginationQuery);
    const filters = parseFilter<Especializada, EspecializadaFilterFields>(
      paginationQuery,
      ESPECIALIZADA_FILTER_MAPPINGS
    );
    const responsavelFilters = parseFilter<Usuario, ResponsavelFilterFields>(
      paginationQuery,
      RESPONSAVEL_FILTER_MAPPINGS
    );

    return withMssqlSession(async (session) => {
      let query = applyFilter(
        selectFromEntity(Especializada)
          .includePick("responsavel", ["id", "nome"])
          .orderBy(especializadaRef.id, "ASC"),
        Especializada,
        filters
      );

      if (responsavelFilters) {
        query = query.whereHas("responsavel", (qb) =>
          applyFilter(qb, Usuario, responsavelFilters)
        );
      }

      const paged = await query.executePaged(session, { page, pageSize });
      return toPagedResponse(paged);
    });
  }

  @Get("/siglas")
  @Returns(EspecializadaSiglasDto)
  async listSiglas() {
    return withMssqlSession(async (session) => {
      const rows = await selectFromEntity(Especializada)
        .select("sigla")
        .distinct(especializadaRef.sigla)
        .where(isNotNull(especializadaRef.sigla))
        .orderBy(especializadaRef.sigla, "ASC")
        .executePlain(session);

      return {
        siglas: rows
          .map((row) => row.sigla)
          .filter((sigla): sigla is string => typeof sigla === "string")
      };
    });
  }

  @Get("/:id")
  @Params(EspecializadaParamsDto)
  @Returns(EspecializadaWithResponsavelDto)
  @EspecializadaErrors
  async getOne(
    ctx: RequestContext<unknown, undefined, EspecializadaParamsDto>
  ) {
    return withMssqlSession(async (session) => {
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
  async create(ctx: RequestContext<CreateEspecializadaDto>) {
    return withMssqlSession(async (session) => {
      const especializada = new Especializada();
      applyEspecializadaMutation(especializada, ctx.body);
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
  ) {
    return withMssqlSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "especializada");
      const especializada = await getEspecializadaEntityOrThrow(session, id);
      applyEspecializadaMutation(especializada, ctx.body);
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
  ) {
    return withMssqlSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "especializada");
      const especializada = await getEspecializadaEntityOrThrow(session, id);
      applyEspecializadaPatch(especializada, ctx.body);
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
  async remove(ctx: RequestContext<unknown, undefined, EspecializadaParamsDto>) {
    return withMssqlSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "especializada");
      const especializada = await getEspecializadaEntityOrThrow(session, id);
      await session.remove(especializada);
      await session.commit();
    });
  }
}
