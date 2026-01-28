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
  selectFromEntity,
  toPagedResponse,
  type OrmSession,
  eq
} from "metal-orm";
import { withSession } from "../../db/mssql";
import { Equipe } from "../../entities/Equipe";
import {
  CreateEquipeDto,
  EquipeErrors,
  EquipePagedResponseDto,
  EquipeParamsDto,
  EquipeQueryDto,
  EquipeQueryDtoClass,
  EquipeOptionsDto,
  EquipeWithEspecializadaDto,
  EquipeOptionDto,
  ReplaceEquipeDto,
  UpdateEquipeDto
} from "../../dtos/equipe/equipe.dtos";

const E = entityRef(Equipe);

type EquipeFilterFields = "nome";

const EQUIPE_FILTER_MAPPINGS = {
  nomeContains: { field: "nome", operator: "contains" }
} satisfies Record<
  string,
  {
    field: EquipeFilterFields;
    operator: "equals" | "contains";
  }
>;

type EquipeInput =
  | CreateEquipeDto
  | ReplaceEquipeDto
  | UpdateEquipeDto;

async function getEquipeEntityOrThrow(
  session: OrmSession,
  id: number
): Promise<Equipe> {
  const equipe = await session.find(Equipe, id);
  if (!equipe) {
    throw new HttpError(404, "Equipe not found.");
  }
  return equipe;
}

async function getEquipeWithEspecializadaOrThrow(
  session: OrmSession,
  id: number
): Promise<Equipe> {
  const query = selectFromEntity(Equipe)
    .includePick("especializada", ["id", "nome"])
    .where(eq(E.id, id));
  const [equipe] = await query.execute(session);
  if (!equipe) {
    throw new HttpError(404, "Equipe not found.");
  }
  return equipe;
}

function compactUpdates<T extends Record<string, unknown>>(updates: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(updates).filter(([, value]) => value !== undefined)
  ) as Partial<T>;
}

function applyEquipeInput(
  entity: Equipe,
  input: EquipeInput,
  options: { partial: boolean }
) {
  const payload = options.partial ? compactUpdates(input) : input;
  Object.assign(entity, payload);
}

function applyEquipeMutation(
  entity: Equipe,
  input: CreateEquipeDto | ReplaceEquipeDto
) {
  applyEquipeInput(entity, input, { partial: false });
}

function applyEquipePatch(entity: Equipe, input: UpdateEquipeDto) {
  applyEquipeInput(entity, input, { partial: true });
}

@Controller("/equipe")
export class EquipeController {
  @Get("/")
  @Query(EquipeQueryDtoClass)
  @Returns(EquipePagedResponseDto)
  async list(ctx: RequestContext<unknown, EquipeQueryDto>): Promise<unknown> {
    const paginationQuery = (ctx.query ?? {}) as Record<string, unknown>;
    const { page, pageSize } = parsePagination(paginationQuery);
    const filters = parseFilter<Equipe, EquipeFilterFields>(
      paginationQuery,
      EQUIPE_FILTER_MAPPINGS
    );

    return withSession(async (session) => {
      let query = applyFilter(
        selectFromEntity(Equipe)
          .includePick("especializada", ["id", "nome"])
          .orderBy(E.id, "ASC"),
        Equipe,
        filters
      );

      const paged = await query.executePaged(session, { page, pageSize });
      return toPagedResponse(paged);
    });
  }

  @Get("/options")
  @Returns(EquipeOptionsDto)
  async listOptions(): Promise<EquipeOptionDto[]> {
    return withSession((session) =>
      selectFromEntity(Equipe)
        .select("id", "nome")
        .orderBy(E.nome, "ASC")
        .executePlain(session)
    );
  }

  @Get("/:id")
  @Params(EquipeParamsDto)
  @Returns(EquipeWithEspecializadaDto)
  @EquipeErrors
  async getOne(
    ctx: RequestContext<unknown, undefined, EquipeParamsDto>
  ): Promise<EquipeWithEspecializadaDto> {
    return withSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "equipe");
      const equipe = await getEquipeWithEspecializadaOrThrow(
        session,
        id
      );
      return equipe as EquipeWithEspecializadaDto;
    });
  }

  @Post("/")
  @Body(CreateEquipeDto)
  @Returns({ status: 201, schema: EquipeWithEspecializadaDto })
  async create(ctx: RequestContext<CreateEquipeDto>): Promise<EquipeWithEspecializadaDto> {
    return withSession(async (session) => {
      const equipe = new Equipe();
      applyEquipeMutation(equipe, ctx.body);
      await session.persist(equipe);
      await session.commit();
      return (await getEquipeWithEspecializadaOrThrow(
        session,
        equipe.id
      )) as EquipeWithEspecializadaDto;
    });
  }

  @Put("/:id")
  @Params(EquipeParamsDto)
  @Body(ReplaceEquipeDto)
  @Returns(EquipeWithEspecializadaDto)
  @EquipeErrors
  async replace(
    ctx: RequestContext<
      ReplaceEquipeDto,
      undefined,
      EquipeParamsDto
    >
  ): Promise<EquipeWithEspecializadaDto> {
    return withSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "equipe");
      const equipe = await getEquipeEntityOrThrow(session, id);
      applyEquipeMutation(equipe, ctx.body);
      await session.commit();
      return (await getEquipeWithEspecializadaOrThrow(
        session,
        id
      )) as EquipeWithEspecializadaDto;
    });
  }

  @Patch("/:id")
  @Params(EquipeParamsDto)
  @Body(UpdateEquipeDto)
  @Returns(EquipeWithEspecializadaDto)
  @EquipeErrors
  async update(
    ctx: RequestContext<UpdateEquipeDto, undefined, EquipeParamsDto>
  ): Promise<EquipeWithEspecializadaDto> {
    return withSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "equipe");
      const equipe = await getEquipeEntityOrThrow(session, id);
      applyEquipePatch(equipe, ctx.body);
      await session.commit();
      return (await getEquipeWithEspecializadaOrThrow(
        session,
        id
      )) as EquipeWithEspecializadaDto;
    });
  }

  @Delete("/:id")
  @Params(EquipeParamsDto)
  @Returns({ status: 204 })
  @EquipeErrors
  async remove(ctx: RequestContext<unknown, undefined, EquipeParamsDto>): Promise<void> {
    return withSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "equipe");
      const equipe = await getEquipeEntityOrThrow(session, id);
      await session.remove(equipe);
      await session.commit();
    });
  }
}
