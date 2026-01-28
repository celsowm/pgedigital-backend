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
  getEntityOrThrow,
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
import { deleteEntity, listOptions } from "../../utils/controller-helpers";

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
      listOptions(session, Equipe, E)
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
      applyInput(equipe, ctx.body as Partial<Equipe>, { partial: false });
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
      const equipe = await getEntityOrThrow(session, Equipe, id, "equipe");
      applyInput(equipe, ctx.body as Partial<Equipe>, { partial: false });
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
      const equipe = await getEntityOrThrow(session, Equipe, id, "equipe");
      applyInput(equipe, ctx.body as Partial<Equipe>, { partial: true });
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
      await deleteEntity(session, Equipe, id, "equipe");
    });
  }
}
