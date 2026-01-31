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
  parseIdOrThrow,
  type RequestContext
} from "adorn-api";
import {
  entityRef,
  selectFromEntity,
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
import { BaseController } from "../../utils/base-controller";

const E = entityRef(Equipe);

type EquipeFilterFields = "nome" | "especializada_id";

const EQUIPE_FILTER_MAPPINGS = {
  nomeContains: { field: "nome", operator: "contains" },
  especializadaId: { field: "especializada_id", operator: "equals" }
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
export class EquipeController extends BaseController<Equipe, EquipeFilterFields> {
  get entityClass() {
    return Equipe;
  }

  get entityRef(): any {
    return E;
  }

  get filterMappings(): Record<string, { field: EquipeFilterFields; operator: "equals" | "contains" }> {
    return EQUIPE_FILTER_MAPPINGS;
  }

  get entityName() {
    return "equipe";
  }
  @Get("/")
  @Query(EquipeQueryDtoClass)
  @Returns(EquipePagedResponseDto)
  async list(ctx: RequestContext<unknown, EquipeQueryDto>): Promise<unknown> {
    return super.list(ctx, (query) =>
      query.includePick("especializada", ["id", "nome"])
    );
  }

  @Get("/options")
  @Returns(EquipeOptionsDto)
  async listOptions(): Promise<EquipeOptionDto[]> {
    return super.listOptions();
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
      const equipe = await super.getEntityOrThrow(session, id);
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
      const equipe = await super.getEntityOrThrow(session, id);
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
      await super.delete(session, id);
    });
  }
}
