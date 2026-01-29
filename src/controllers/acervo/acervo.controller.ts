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
import { Acervo } from "../../entities/Acervo";
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
  ClassificacaoResumoDto,
  CreateAcervoDto,
  DestinatarioResumoDto,
  RaizCnpjResumoDto,
  ReplaceAcervoDto,
  TemaComMateriaDto,
  UpdateAcervoDto
} from "../../dtos/acervo/acervo.dtos";
import { BaseController } from "../../utils/base-controller";

const A = entityRef(Acervo);

type AcervoFilterFields = "nome" | "especializada_id" | "tipo_acervo_id" | "ativo";

const ACERVO_FILTER_MAPPINGS = {
  nomeContains: { field: "nome", operator: "contains" },
  especializadaId: { field: "especializada_id", operator: "equals" },
  tipoAcervoId: { field: "tipo_acervo_id", operator: "equals" },
  ativo: { field: "ativo", operator: "equals" }
} satisfies Record<
  string,
  {
    field: AcervoFilterFields;
    operator: "equals" | "contains";
  }
>;

async function getAcervoWithRelationsOrThrow(
  session: OrmSession,
  id: number
): Promise<any> {
  const query = selectFromEntity(Acervo)
    .includePick("especializada", ["id", "nome"])
    .includePick("procuradorTitular", ["id", "nome"])
    .includePick("tipoAcervo", ["id", "nome"])
    .includePick("tipoMigracaoAcervo", ["id", "nome"])
    .includePick("equipeResponsavel", ["id", "nome"])
    .includePick("tipoDivisaoCargaTrabalho", ["id", "nome"])
    .where(eq(A.id, id));
  const [acervo] = await query.execute(session);
  if (!acervo) {
    throw new HttpError(404, "Acervo not found.");
  }
  return acervo;
}

const pick = <T, K extends keyof T>(obj: T | undefined, ...keys: K[]): Pick<T, K> | undefined =>
  obj ? keys.reduce((acc, k) => ((acc[k] = obj[k]), acc), {} as Pick<T, K>) : undefined;

const flattenPivot = <T, R>(arr: any[] | undefined, key: string, mapper: (item: T) => R): R[] =>
  arr?.filter((p) => p[key]).map((p) => mapper(p[key])) ?? [];

async function getAcervoDetailOrThrow(
  session: OrmSession,
  id: number
): Promise<AcervoDetailDto> {
  const [acervo] = await selectFromEntity(Acervo)
    .includePick("especializada", ["id", "nome"])
    .includePick("procuradorTitular", ["id", "nome"])
    .includePick("tipoAcervo", ["id", "nome"])
    .includePick("tipoMigracaoAcervo", ["id", "nome"])
    .includePick("equipeResponsavel", ["id", "nome"])
    .includePick("tipoDivisaoCargaTrabalho", ["id", "nome"])
    .include({
      acervoClassificacaos: { include: { classificacao: { columns: ["id", "nome"] } } },
      acervoTemas: { include: { tema: { columns: ["id", "nome"], include: { materia: { columns: ["nome"] } } } } },
      acervoDestinatarioPas: { include: { destinatarioPa: { columns: ["id", "nome", "login", "cargo", "estado_inatividade"], include: { especializada: { columns: ["nome"] } } } } },
      raizCnpjAcervos: { columns: ["id", "raiz"] }
    })
    .where(eq(A.id, id))
    .execute(session) as any[];

  if (!acervo) throw new HttpError(404, "Acervo not found.");

  return {
    id: acervo.id,
    nome: acervo.nome,
    especializada: pick(acervo.especializada, "id", "nome"),
    procuradorTitular: pick(acervo.procuradorTitular, "id", "nome"),
    tipoAcervo: pick(acervo.tipoAcervo, "id", "nome"),
    rotina_sob_demanda: acervo.rotina_sob_demanda,
    tipoMigracaoAcervo: pick(acervo.tipoMigracaoAcervo, "id", "nome"),
    equipeResponsavel: pick(acervo.equipeResponsavel, "id", "nome"),
    tipoDivisaoCargaTrabalho: pick(acervo.tipoDivisaoCargaTrabalho, "id", "nome"),
    ativo: acervo.ativo,
    classificacoes: flattenPivot(acervo.acervoClassificacaos, "classificacao", (c: any) => pick(c, "id", "nome")!),
    temasRelacionados: flattenPivot(acervo.acervoTemas, "tema", (t: any) => ({ id: t.id, nome: t.nome, materiaNome: t.materia?.nome ?? "" })),
    destinatarios: flattenPivot(acervo.acervoDestinatarioPas, "destinatarioPa", (u: any) => ({
      id: u.id, nome: u.nome, login: u.login, cargo: u.cargo,
      especializada_nome: u.especializada?.nome, ativo: !u.estado_inatividade
    })),
    raizesCnpj: acervo.raizCnpjAcervos?.map((r: any) => pick(r, "id", "raiz")!) ?? []
  };
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
  @Returns(AcervoOptionsDto)
  async listOptions(): Promise<AcervoOptionDto[]> {
    return super.listOptions();
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
      const result = await getAcervoWithRelationsOrThrow(session, acervo.id);
      return this.mapToWithRelationsDto(result);
    });
  }

  @Put("/:id")
  @Params(AcervoParamsDto)
  @Body(ReplaceAcervoDto)
  @Returns(AcervoWithRelationsDto)
  @AcervoErrors
  async replace(
    ctx: RequestContext<ReplaceAcervoDto, undefined, AcervoParamsDto>
  ): Promise<AcervoWithRelationsDto> {
    return withSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "acervo");
      const acervo = await super.getEntityOrThrow(session, id);
      applyInput(acervo, ctx.body as Partial<Acervo>, { partial: false });
      await session.commit();
      const result = await getAcervoWithRelationsOrThrow(session, id);
      return this.mapToWithRelationsDto(result);
    });
  }

  @Patch("/:id")
  @Params(AcervoParamsDto)
  @Body(UpdateAcervoDto)
  @Returns(AcervoWithRelationsDto)
  @AcervoErrors
  async update(
    ctx: RequestContext<UpdateAcervoDto, undefined, AcervoParamsDto>
  ): Promise<AcervoWithRelationsDto> {
    return withSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "acervo");
      const acervo = await super.getEntityOrThrow(session, id);
      applyInput(acervo, ctx.body as Partial<Acervo>, { partial: true });
      await session.commit();
      const result = await getAcervoWithRelationsOrThrow(session, id);
      return this.mapToWithRelationsDto(result);
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

  private mapToWithRelationsDto(acervo: any): AcervoWithRelationsDto {
    return {
      id: acervo.id,
      nome: acervo.nome,
      especializada: acervo.especializada
        ? { id: acervo.especializada.id, nome: acervo.especializada.nome }
        : undefined,
      procuradorTitular: acervo.procuradorTitular
        ? { id: acervo.procuradorTitular.id, nome: acervo.procuradorTitular.nome }
        : undefined,
      tipoAcervo: acervo.tipoAcervo
        ? { id: acervo.tipoAcervo.id, nome: acervo.tipoAcervo.nome }
        : undefined,
      rotina_sob_demanda: acervo.rotina_sob_demanda,
      tipoMigracaoAcervo: acervo.tipoMigracaoAcervo
        ? { id: acervo.tipoMigracaoAcervo.id, nome: acervo.tipoMigracaoAcervo.nome }
        : undefined,
      equipeResponsavel: acervo.equipeResponsavel
        ? { id: acervo.equipeResponsavel.id, nome: acervo.equipeResponsavel.nome }
        : undefined,
      tipoDivisaoCargaTrabalho: acervo.tipoDivisaoCargaTrabalho
        ? { id: acervo.tipoDivisaoCargaTrabalho.id, nome: acervo.tipoDivisaoCargaTrabalho.nome }
        : undefined,
      ativo: acervo.ativo
    };
  }
}
