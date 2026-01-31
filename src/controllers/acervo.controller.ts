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
import { withSession } from "../db/mssql";
import { Acervo } from "../entities/Acervo";
import {
  AcervoDetailDto,
  AcervoErrors,
  AcervoOptionDto,
  AcervoOptionsDto,
  AcervoPagedResponseDto,
  AcervoParamsDto,
  AcervoQueryDto,
  AcervoQueryDtoClass,
  AcervoWithRelationsDto,
  CreateAcervoDto,
  ReplaceAcervoDto,
  UpdateAcervoDto
} from "../dtos/acervo/acervo.dtos";
import { BaseController } from "../utils/base-controller";

const A = entityRef(Acervo);

type AcervoFilterFields = "nome" | "especializada_id" | "tipo_acervo_id" | "ativo";

const ACERVO_FILTER_MAPPINGS = {
  nomeContains: { field: "nome", operator: "contains" },
  especializadaId: { field: "especializada_id", operator: "equals" },
  tipoAcervoId: { field: "tipo_acervo_id", operator: "equals" },
  ativo: { field: "ativo", operator: "equals" }
} satisfies Record<string, { field: AcervoFilterFields; operator: "equals" | "contains" }>;



const baseAcervoQuery = () =>
  selectFromEntity(Acervo)
    .includePick("especializada", ["id", "nome"])
    .includePick("procuradorTitular", ["id", "nome"])
    .includePick("tipoAcervo", ["id", "nome"])
    .includePick("tipoMigracaoAcervo", ["id", "nome"])
    .includePick("equipeResponsavel", ["id", "nome"])
    .includePick("tipoDivisaoCargaTrabalho", ["id", "nome"]);

async function getAcervoWithRelationsOrThrow(session: OrmSession, id: number): Promise<AcervoWithRelationsDto> {
  const [acervo] = await baseAcervoQuery().where(eq(A.id, id)).execute(session);
  if (!acervo) throw new HttpError(404, "Acervo not found.");
  return acervo as AcervoWithRelationsDto;
}

async function getAcervoDetailOrThrow(session: OrmSession, id: number): Promise<AcervoDetailDto> {
  const [acervo] = await baseAcervoQuery()
    .include("equipes", { columns: ["id", "nome"], include: { especializada: { columns: ["id", "nome"] } } })
    .include("classificacoes", { columns: ["id", "nome"] })
    .include("temasRelacionados", { columns: ["id", "nome"], include: { materia: { columns: ["nome"] } } })
    .include("destinatarios", {
      columns: ["id", "nome", "login", "cargo", "estado_inatividade"],
      include: { especializada: { columns: ["id", "nome"] } }
    })
    .include("raizesCNPJs", { pivot: { columns: ["id", "raiz"] } })
    .where(eq(A.id, id))
    .execute(session);

  if (!acervo) throw new HttpError(404, "Acervo not found.");
  return acervo as AcervoDetailDto;
}

@Controller("/acervo")
export class AcervoController extends BaseController<Acervo, AcervoFilterFields> {
  get entityClass() {
    return Acervo;
  }

  get entityRef(): any {
    return A;
  }

  get filterMappings(): Record<string, { field: AcervoFilterFields; operator: "equals" | "contains" }> {
    return ACERVO_FILTER_MAPPINGS;
  }

  get entityName() {
    return "acervo";
  }

  @Get("/")
  @Query(AcervoQueryDtoClass)
  @Returns(AcervoPagedResponseDto)
  async list(ctx: RequestContext<unknown, AcervoQueryDto>): Promise<unknown> {
    return super.list(ctx, (query) =>
      query
        .includePick("especializada", ["id", "nome"])
        .includePick("procuradorTitular", ["id", "nome"])
        .includePick("tipoAcervo", ["id", "nome"])
    );
  }

  @Get("/options")
  @Query(AcervoQueryDtoClass)
  @Returns(AcervoOptionsDto)
  async listOptions(ctx: RequestContext<unknown, AcervoQueryDto>): Promise<AcervoOptionDto[]> {
    return super.listOptions(ctx);
  }

  @Get("/:id")
  @Params(AcervoParamsDto)
  @Returns(AcervoDetailDto)
  @AcervoErrors
  async getOne(
    ctx: RequestContext<unknown, undefined, AcervoParamsDto>
  ): Promise<AcervoDetailDto> {
    return withSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "acervo");
      return getAcervoDetailOrThrow(session, id);
    });
  }

  @Post("/")
  @Body(CreateAcervoDto)
  @Returns({ status: 201, schema: AcervoWithRelationsDto })
  async create(ctx: RequestContext<CreateAcervoDto>): Promise<AcervoWithRelationsDto> {
    return withSession(async (session) => {
      const acervo = new Acervo();
      applyInput(acervo, ctx.body as Partial<Acervo>, { partial: false });
      await session.persist(acervo);
      await session.commit();
      return getAcervoWithRelationsOrThrow(session, acervo.id);
    });
  }

  @Put("/:id")
  @Params(AcervoParamsDto)
  @Body(ReplaceAcervoDto)
  @Returns(AcervoWithRelationsDto)
  @AcervoErrors
  async replace(ctx: RequestContext<ReplaceAcervoDto, undefined, AcervoParamsDto>): Promise<AcervoWithRelationsDto> {
    return withSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "acervo");
      const acervo = await super.getEntityOrThrow(session, id);
      applyInput(acervo, ctx.body as Partial<Acervo>, { partial: false });
      await session.commit();
      return getAcervoWithRelationsOrThrow(session, id);
    });
  }

  @Patch("/:id")
  @Params(AcervoParamsDto)
  @Body(UpdateAcervoDto)
  @Returns(AcervoWithRelationsDto)
  @AcervoErrors
  async update(ctx: RequestContext<UpdateAcervoDto, undefined, AcervoParamsDto>): Promise<AcervoWithRelationsDto> {
    return withSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "acervo");
      const acervo = await super.getEntityOrThrow(session, id);
      applyInput(acervo, ctx.body as Partial<Acervo>, { partial: true });
      await session.commit();
      return getAcervoWithRelationsOrThrow(session, id);
    });
  }

  @Delete("/:id")
  @Params(AcervoParamsDto)
  @Returns({ status: 204 })
  @AcervoErrors
  async remove(ctx: RequestContext<unknown, undefined, AcervoParamsDto>): Promise<void> {
    return withSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "acervo");
      await super.delete(session, id);
    });
  }
}
