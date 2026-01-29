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
import { AcervoClassificacao } from "../../entities/AcervoClassificacao";
import { AcervoDestinatarioPa } from "../../entities/AcervoDestinatarioPa";
import { AcervoTema } from "../../entities/AcervoTema";
import { RaizCnpjAcervo } from "../../entities/RaizCnpjAcervo";
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
const AC = entityRef(AcervoClassificacao);
const AT = entityRef(AcervoTema);
const ADP = entityRef(AcervoDestinatarioPa);
const RCA = entityRef(RaizCnpjAcervo);

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

async function getAcervoDetailOrThrow(
  session: OrmSession,
  id: number
): Promise<AcervoDetailDto> {
  const acervo = await getAcervoWithRelationsOrThrow(session, id);

  const acervoClassificacoes = await selectFromEntity(AcervoClassificacao)
    .includePick("classificacao", ["id", "nome"])
    .where(eq(AC.acervo_id, id))
    .execute(session);

  const classificacoes: ClassificacaoResumoDto[] = acervoClassificacoes
    .filter((ac: any) => ac.classificacao)
    .map((ac: any) => ({
      id: ac.classificacao.id,
      nome: ac.classificacao.nome
    }));

  const acervoTemas = await selectFromEntity(AcervoTema)
    .includePick("tema", ["id", "nome", "materia_id"])
    .where(eq(AT.acervo_id, id))
    .execute(session);

  const temasRelacionados: TemaComMateriaDto[] = [];
  for (const at of acervoTemas as any[]) {
    if (at.tema) {
      const { Tema } = await import("../../entities/Tema");
      const { Materia } = await import("../../entities/Materia");
      const tema = await session.find(Tema, at.tema.id);
      let materiaNome = "";
      if (tema?.materia_id) {
        const materia = await session.find(Materia, tema.materia_id);
        materiaNome = materia?.nome || "";
      }
      temasRelacionados.push({
        id: at.tema.id,
        nome: at.tema.nome,
        materiaNome
      });
    }
  }

  const acervoDestinatarios = await selectFromEntity(AcervoDestinatarioPa)
    .include("destinatarioPa")
    .where(eq(ADP.acervo_id, id))
    .execute(session);

  const destinatarios: DestinatarioResumoDto[] = [];
  for (const adp of acervoDestinatarios as any[]) {
    if (adp.destinatarioPa) {
      const user = adp.destinatarioPa;
      let especializada_nome: string | undefined;
      if (user.especializada_id) {
        const { Especializada } = await import("../../entities/Especializada");
        const esp = await session.find(Especializada, user.especializada_id);
        especializada_nome = esp?.nome;
      }
      destinatarios.push({
        id: user.id,
        nome: user.nome,
        login: user.login,
        cargo: user.cargo,
        especializada_nome,
        ativo: !user.estado_inatividade
      });
    }
  }

  const raizesCnpjResult = await selectFromEntity(RaizCnpjAcervo)
    .where(eq(RCA.acervo_id, id))
    .execute(session);

  const raizesCnpj: RaizCnpjResumoDto[] = (raizesCnpjResult as any[]).map((rcnpj) => ({
    id: rcnpj.id,
    raiz: rcnpj.raiz
  }));

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
    ativo: acervo.ativo,
    classificacoes,
    temasRelacionados,
    destinatarios,
    raizesCnpj
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
