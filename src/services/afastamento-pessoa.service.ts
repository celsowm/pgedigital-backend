import {
  HttpError,
  applyInput,
  parseFilter,
  parsePagination
} from "adorn-api";
import {
  and,
  applyFilter,
  entityRef,
  eq,
  gt,
  gte,
  inList,
  inSubquery,
  like,
  neq,
  lt,
  lte,
  or,
  selectFromEntity,
  toPagedResponse
} from "metal-orm";
import { withSession } from "../db/mssql";
import { AfastamentoPessoa } from "../entities/AfastamentoPessoa";
import { AfastamentoPessoaUsuario } from "../entities/AfastamentoPessoaUsuario";
import { Especializada } from "../entities/Especializada";
import { FilaCircular } from "../entities/FilaCircular";
import { TipoDivisaoCargaTrabalho } from "../entities/TipoDivisaoCargaTrabalho";
import { Usuario } from "../entities/Usuario";
import { VwAfastamentoPessoa } from "../entities/VwAfastamentoPessoa";
import type {
  AfastamentoPessoaDetailDto,
  AfastamentoPessoaQueryDto,
  CreateAfastamentoPessoaDto,
  ReplaceAfastamentoPessoaDto,
  UpdateAfastamentoPessoaDto,
  AfastamentoPessoaSubstitutoDto,
  AfastamentoPessoaSubstitutoInputDto,
  AfastamentoPessoaFilterFields
} from "../dtos/afastamento-pessoa/afastamento-pessoa.dtos";
import {
  AfastamentoPessoaRepository,
  AFASTAMENTO_PESSOA_FILTER_MAPPINGS
} from "../repositories/afastamento-pessoa.repository";

const FINAL_DE_PROCESSO_NOME = "Final de Processo";

export class AfastamentoPessoaService {
  private readonly repository: AfastamentoPessoaRepository;
  private readonly entityName = "afastamento pessoa";
  private tipoDivisaoFinalProcessoId?: number | null;

  constructor(repository?: AfastamentoPessoaRepository) {
    this.repository = repository ?? new AfastamentoPessoaRepository();
  }

  async list(query: AfastamentoPessoaQueryDto): Promise<unknown> {
    const paginationQuery = (query ?? {}) as Record<string, unknown>;
    const { page, pageSize } = parsePagination(paginationQuery);
    const filters = parseFilter<AfastamentoPessoa, AfastamentoPessoaFilterFields>(
      paginationQuery,
      AFASTAMENTO_PESSOA_FILTER_MAPPINGS
    );

    return withSession(async (session) => {
      let baseQuery = this.repository.buildListQuery();
      if (filters) {
        baseQuery = applyFilter(baseQuery, this.repository.entityClass, filters);
      }

      baseQuery = this.applyCustomFilters(baseQuery, query ?? {});

      const paged = await baseQuery.executePaged(session, { page, pageSize });
      const response = toPagedResponse(paged);
      response.items = await Promise.all(
        response.items.map((item: unknown) => this.mapListItem(item as Record<string, unknown>))
      );
      return response;
    });
  }

  async getOne(id: number): Promise<AfastamentoPessoaDetailDto> {
    return withSession(async (session) => {
      return this.loadDetail(session, id);
    });
  }

  async create(input: CreateAfastamentoPessoaDto): Promise<AfastamentoPessoaDetailDto> {
    return withSession(async (session) => {
      const { usuarios, ...rest } = input as Record<string, unknown>;

      const afastamentoPessoa = new AfastamentoPessoa();
      applyInput(afastamentoPessoa, rest as Partial<AfastamentoPessoa>, { partial: false });
      afastamentoPessoa.data_criacao = new Date();
      if (!afastamentoPessoa.tipo_divisao_carga_trabalho_id) {
        afastamentoPessoa.tipo_divisao_carga_trabalho_id = 1;
      }

      const afastadoInfo = await this.getUsuarioAfastadoInfo(session, afastamentoPessoa.usuario_id);
      if (!afastadoInfo) {
        throw new HttpError(404, "Usuario nao encontrado.");
      }

      if (
        !afastadoInfo.cargo ||
        !afastadoInfo.lotacao ||
        afastadoInfo.cargo === "-" ||
        afastadoInfo.lotacao === "-"
      ) {
        throw new HttpError(400, "Nao e possivel afastar usuario sem cargo ou unidade.");
      }

      const substitutos = this.normalizeSubstitutosInput(usuarios);
      const substitutoIds = substitutos.map(item => item.id);

      if (this.necessitaSubstitutos(afastadoInfo.vinculo) && substitutoIds.length === 0) {
        throw new HttpError(400, "Insira ao menos um substituto.");
      }

      const validacao = await this.validacaoAfastamento(
        session,
        afastamentoPessoa,
        substitutoIds,
        afastadoInfo.vinculo,
        null
      );

      if (!validacao.ok) {
        throw new HttpError(400, validacao.message);
      }

      if (substitutoIds.length > 0) {
        const fila = await this.criaFila(session, substitutoIds);
        if (!fila) {
          throw new HttpError(400, "Falha ao criar fila circular.");
        }
        afastamentoPessoa.fila_circular_id = fila.id;
      }

      await session.persist(afastamentoPessoa);
      await session.commit();

      if (substitutos.length > 0) {
        await this.syncSubstitutos(
          session,
          afastamentoPessoa,
          substitutos,
          afastamentoPessoa.tipo_divisao_carga_trabalho_id,
          { replace: false }
        );
        await session.commit();
      }

      return this.loadDetail(session, afastamentoPessoa.id);
    });
  }

  async replace(id: number, input: ReplaceAfastamentoPessoaDto): Promise<AfastamentoPessoaDetailDto> {
    return this.updateInternal(id, input as UpdateAfastamentoPessoaDto, false);
  }

  async update(id: number, input: UpdateAfastamentoPessoaDto): Promise<AfastamentoPessoaDetailDto> {
    return this.updateInternal(id, input, true);
  }

  async remove(id: number): Promise<void> {
    return withSession(async (session) => {
      const afastamentoPessoa = await this.repository.findById(session, id);
      if (!afastamentoPessoa) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }

      if (this.isEmVigencia(afastamentoPessoa.data_inicio, afastamentoPessoa.data_fim)) {
        throw new HttpError(400, "Nao e possivel realizar a operacao. Afastamento esta em vigencia.");
      }

      await this.removeSubstitutos(session, id);
      await session.remove(afastamentoPessoa);
      await session.commit();
    });
  }

  private async loadDetail(session: any, id: number): Promise<AfastamentoPessoaDetailDto> {
    const [detail] = await this.repository.buildDetailQuery()
      .where(eq(this.repository.entityRef.id, id))
      .execute(session);

    if (!detail) {
      throw new HttpError(404, `${this.entityName} not found.`);
    }

    return this.mapDetail(detail as Record<string, unknown>);
  }

  private async updateInternal(
    id: number,
    input: UpdateAfastamentoPessoaDto,
    partial: boolean
  ): Promise<AfastamentoPessoaDetailDto> {
    return withSession(async (session) => {
      const afastamentoPessoa = await this.repository.findById(session, id);
      if (!afastamentoPessoa) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }

      const emVigencia = this.isEmVigencia(afastamentoPessoa.data_inicio, afastamentoPessoa.data_fim);
      const rawInput = input as Record<string, unknown>;
      const hasUsuarios = Object.prototype.hasOwnProperty.call(rawInput, "usuarios");
      const { usuarios, ...rest } = rawInput;

      applyInput(afastamentoPessoa, rest as Partial<AfastamentoPessoa>, { partial });

      if (!afastamentoPessoa.tipo_divisao_carga_trabalho_id) {
        afastamentoPessoa.tipo_divisao_carga_trabalho_id = 1;
      }

      const afastadoInfo = await this.getUsuarioAfastadoInfo(session, afastamentoPessoa.usuario_id);
      if (!afastadoInfo) {
        throw new HttpError(404, "Usuario nao encontrado.");
      }

      let substitutos = this.normalizeSubstitutosInput(usuarios);
      if (!hasUsuarios || (emVigencia && substitutos.length === 0)) {
        substitutos = await this.getSubstitutosExistentes(afastamentoPessoa);
      }

      const substitutoIds = substitutos.map(item => item.id);

      if (this.necessitaSubstitutos(afastadoInfo.vinculo) && substitutoIds.length === 0) {
        throw new HttpError(400, "Insira ao menos um substituto.");
      }

      const validacao = await this.validacaoAfastamento(
        session,
        afastamentoPessoa,
        substitutoIds,
        afastadoInfo.vinculo,
        id
      );

      if (!validacao.ok) {
        throw new HttpError(400, validacao.message);
      }

      await session.commit();

      if (!emVigencia && hasUsuarios) {
        await this.syncSubstitutos(
          session,
          afastamentoPessoa,
          substitutos,
          afastamentoPessoa.tipo_divisao_carga_trabalho_id,
          { replace: true }
        );
        await session.commit();
      }

      return this.loadDetail(session, id);
    });
  }

  private applyCustomFilters(query: any, params: AfastamentoPessoaQueryDto): any {
    const ref = this.repository.entityRef;
    const queryParams = params ?? {};
    const usuarioRef = entityRef(Usuario);

    if (queryParams.dataInicio || queryParams.dataFim) {
      const dataInicio = this.toDateString(queryParams.dataInicio) ?? undefined;
      const dataFim = this.toDateString(queryParams.dataFim) ?? undefined;

      if (dataInicio && dataFim) {
        query = query.where(
          and(
            lte(ref.data_inicio, dataFim),
            gte(ref.data_inicio, dataInicio),
            lte(ref.data_fim, dataFim),
            gte(ref.data_fim, dataInicio)
          )
        );
      } else if (dataInicio) {
        query = query.where(gte(ref.data_inicio, dataInicio));
      } else if (dataFim) {
        query = query.where(lte(ref.data_fim, dataFim));
      }
    }

    if (queryParams.statusAfastamento) {
      const status = this.normalizeStatus(queryParams.statusAfastamento);
      const hoje = this.toDateString(new Date());
      if (status && hoje) {
        if (status === "finalizado") {
          query = query.where(lt(ref.data_fim, hoje));
        } else if (status === "vigente") {
          query = query.where(and(lte(ref.data_inicio, hoje), gte(ref.data_fim, hoje)));
        } else if (status === "programado") {
          query = query.where(gt(ref.data_inicio, hoje));
        }
      }
    }

    if (queryParams.substitutoId) {
      query = query.whereHas("substitutos", (qb: any) =>
        qb.where(eq(usuarioRef.id, queryParams.substitutoId))
      );
    }

    if (queryParams.especializadaId) {
      query = query.whereHas("usuario", (qb: any) =>
        qb.where(eq(usuarioRef.especializada_id, queryParams.especializadaId))
      );
    }

    if (queryParams.cargoContains) {
      query = query.whereHas("usuario", (qb: any) =>
        qb.where(like(usuarioRef.cargo, `%${queryParams.cargoContains}%`))
      );
    }

    return query;
  }

  private normalizeStatus(value?: string): "finalizado" | "vigente" | "programado" | undefined {
    if (!value) return undefined;
    const normalized = value
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    if (normalized === "finalizado") return "finalizado";
    if (normalized === "programado") return "programado";
    if (normalized === "em vigencia" || normalized === "vigencia" || normalized === "vigente") {
      return "vigente";
    }

    return undefined;
  }

  private toDateString(value: unknown): string | null {
    if (!value) return null;
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    if (typeof value === "string" && value.length >= 10) return value.slice(0, 10);
    return null;
  }

  private isEmVigencia(dataInicio?: Date, dataFim?: Date): boolean {
    const hoje = this.toDateString(new Date());
    const inicio = this.toDateString(dataInicio ?? null);
    const fim = this.toDateString(dataFim ?? null);
    if (!hoje || !inicio || !fim) return false;
    return inicio <= hoje && hoje <= fim;
  }

  private buildDateCandidates(afastamento: AfastamentoPessoa): string[] {
    const datas: string[] = [];
    const inicio = this.toDateString(afastamento.data_inicio);
    const fim = this.toDateString(afastamento.data_fim);
    if (inicio) datas.push(inicio);
    if (fim) datas.push(fim);

    const inicioCom = this.toDateString(afastamento.data_inicio_comunicacao);
    const fimCom = this.toDateString(afastamento.data_fim_comunicacao);
    if (inicioCom && fimCom) {
      datas.push(inicioCom);
      datas.push(fimCom);
    }
    return datas;
  }

  private buildOverlapPredicate(viewRef: any, datas: string[]): any | null {
    if (datas.length === 0) return null;
    const predicates = datas.map((data) =>
      and(lte(viewRef.menor_data_inicio, data), gte(viewRef.maior_data_fim, data))
    );
    return predicates.length === 1 ? predicates[0] : or(...predicates);
  }

  private async validacaoAfastamento(
    session: any,
    afastamento: AfastamentoPessoa,
    substitutoIds: number[],
    vinculoAfastado?: string | null,
    excludeId?: number | null
  ): Promise<{ ok: boolean; message: string }> {
    const datas = this.buildDateCandidates(afastamento);

    if (await this.substitutoEstaAfastado(session, datas, substitutoIds)) {
      return {
        ok: false,
        message: "Nao e possivel realizar a operacao. Um substituto ja possui afastamento para o referido periodo."
      };
    }

    if (await this.estaSubstituindoAfastamento(session, datas, afastamento.usuario_id)) {
      return {
        ok: false,
        message: `Nao e possivel realizar a operacao. ${vinculoAfastado ?? "Usuario"} esta cadastrado como substituto para o referido periodo.`
      };
    }

    if (!(await this.todosProcuradores(session, afastamento.usuario_id, substitutoIds))) {
      return {
        ok: false,
        message: "Nao e possivel realizar a operacao. Somente Procuradores podem substituir Procuradores."
      };
    }

    if (!this.dateRangeValido(afastamento)) {
      return {
        ok: false,
        message: "Nao e possivel realizar a operacao. Data de fim deve ser igual ou superior a data de inicio."
      };
    }

    if (await this.afastamentoVigenteParaUsuario(session, datas, afastamento.usuario_id, excludeId ?? undefined)) {
      return {
        ok: false,
        message: `Nao e possivel realizar a operacao. ${vinculoAfastado ?? "Usuario"} ja possui afastamento cadastrado no sistema para o referido periodo.`
      };
    }

    return { ok: true, message: "" };
  }

  private dateRangeValido(afastamento: AfastamentoPessoa): boolean {
    const inicio = this.toDateString(afastamento.data_inicio);
    const fim = this.toDateString(afastamento.data_fim);
    if (!inicio || !fim) return true;
    return inicio <= fim;
  }

  private async substitutoEstaAfastado(
    session: any,
    datas: string[],
    substitutoIds: number[]
  ): Promise<boolean> {
    if (!substitutoIds.length) return false;
    const viewRef = entityRef(VwAfastamentoPessoa);
    const predicate = this.buildOverlapPredicate(viewRef, datas);
    if (!predicate) return false;

    const rows = await selectFromEntity(VwAfastamentoPessoa)
      .select({ usuario_id: viewRef.usuario_id })
      .where(predicate)
      .where(inList(viewRef.usuario_id, substitutoIds))
      .executePlain(session);

    return rows.length > 0;
  }

  private async estaSubstituindoAfastamento(
    session: any,
    datas: string[],
    usuarioId: number
  ): Promise<boolean> {
    const viewRef = entityRef(VwAfastamentoPessoa);
    const predicate = this.buildOverlapPredicate(viewRef, datas);
    if (!predicate) return false;

    const overlapQuery = selectFromEntity(VwAfastamentoPessoa)
      .select({ id: viewRef.id })
      .where(predicate);

    const pivotRef = entityRef(AfastamentoPessoaUsuario);
    const rows = await selectFromEntity(AfastamentoPessoaUsuario)
      .select({ id: pivotRef.id })
      .where(and(eq(pivotRef.usuario_id, usuarioId), inSubquery(pivotRef.afastamento_pessoa_id, overlapQuery)))
      .executePlain(session);

    return rows.length > 0;
  }

  private async afastamentoVigenteParaUsuario(
    session: any,
    datas: string[],
    usuarioId: number,
    excludeId?: number
  ): Promise<boolean> {
    const viewRef = entityRef(VwAfastamentoPessoa);
    const predicate = this.buildOverlapPredicate(viewRef, datas);
    if (!predicate) return false;

    let query = selectFromEntity(VwAfastamentoPessoa)
      .select({ id: viewRef.id })
      .where(and(predicate, eq(viewRef.usuario_id, usuarioId)));

    if (excludeId) {
      query = query.where(neq(viewRef.id, excludeId));
    }

    const rows = await query.executePlain(session);
    return rows.length > 0;
  }

  private async todosProcuradores(
    session: any,
    usuarioAfastadoId: number,
    substitutoIds: number[]
  ): Promise<boolean> {
    if (!substitutoIds.length) return true;

    const usuarioRef = entityRef(Usuario);
    const [afastado] = (await selectFromEntity(Usuario)
      .select({ id: usuarioRef.id, vinculo: usuarioRef.vinculo })
      .where(eq(usuarioRef.id, usuarioAfastadoId))
      .executePlain(session)) as Array<{ id: number; vinculo?: string | null }>;

    const vinculoAfastado = (afastado?.vinculo as string | undefined) ?? "";
    if (!vinculoAfastado.includes("Procurador")) {
      return true;
    }

    const substitutos = (await selectFromEntity(Usuario)
      .select({ id: usuarioRef.id, vinculo: usuarioRef.vinculo })
      .where(inList(usuarioRef.id, substitutoIds))
      .executePlain(session)) as Array<{ id: number; vinculo?: string | null }>;

    return substitutos.every((sub) => String(sub.vinculo ?? "").includes("Procurador"));
  }

  private necessitaSubstitutos(vinculo?: string | null): boolean {
    if (!vinculo) return false;
    return vinculo.includes("Procurador") || vinculo.includes("Servidor");
  }

  private normalizeSubstitutosInput(raw: unknown): AfastamentoPessoaSubstitutoInputDto[] {
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((item) => item && typeof item === "object")
      .map((item) => item as AfastamentoPessoaSubstitutoInputDto);
  }

  private async syncSubstitutos(
    session: any,
    afastamentoPessoa: AfastamentoPessoa,
    substitutos: AfastamentoPessoaSubstitutoInputDto[],
    tipoDivisaoCargaTrabalhoId: number,
    options: { replace?: boolean } = {}
  ): Promise<void> {
    await afastamentoPessoa.substitutos.load();

    if (!substitutos.length) {
      if (options.replace) {
        for (const existing of [...afastamentoPessoa.substitutos.getItems()]) {
          afastamentoPessoa.substitutos.detach(existing);
        }
      }
      return;
    }

    const finalProcessoId = await this.getTipoDivisaoFinalProcessoId(session);
    const usaFinal = finalProcessoId != null && tipoDivisaoCargaTrabalhoId === finalProcessoId;

    const incomingIds = new Set(substitutos.map(item => String(item.id)));
    for (const substituto of substitutos) {
      const pivotPayload = this.buildSubstitutoPivotPayload(substituto, usaFinal);
      afastamentoPessoa.substitutos.attach(substituto.id, pivotPayload);
    }

    if (options.replace) {
      for (const existing of [...afastamentoPessoa.substitutos.getItems()]) {
        const existingId = (existing as unknown as Record<string, unknown>).id as number | string | undefined;
        if (existingId === undefined) continue;
        if (!incomingIds.has(String(existingId))) {
          afastamentoPessoa.substitutos.detach(existing);
        }
      }
    }
  }

  private buildSubstitutoPivotPayload(
    substituto: AfastamentoPessoaSubstitutoInputDto,
    usaFinal: boolean
  ): Record<string, unknown> {
    const normalizedFinal = usaFinal ? this.normalizeFinalCodigoPa(substituto.final_codigo_pa) : undefined;
    return {
      usa_equipe_acervo_substituto: Boolean(substituto.usa_equipe_acervo_substituto),
      final_codigo_pa: usaFinal ? (normalizedFinal ?? null) : null
    };
  }

  private normalizeFinalCodigoPa(value: unknown): string | undefined {
    if (value === undefined || value === null) return undefined;
    if (typeof value === "string") return value.trim() === "" ? undefined : value;
    return JSON.stringify(value);
  }

  private async removeSubstitutos(session: any, afastamentoId: number): Promise<void> {
    const pivotRef = entityRef(AfastamentoPessoaUsuario);
    const rows = await selectFromEntity(AfastamentoPessoaUsuario)
      .where(eq(pivotRef.afastamento_pessoa_id, afastamentoId))
      .execute(session);

    for (const row of rows) {
      await session.remove(row);
    }
  }

  private async getSubstitutosExistentes(
    afastamentoPessoa: AfastamentoPessoa
  ): Promise<AfastamentoPessoaSubstitutoInputDto[]> {
    const items = await afastamentoPessoa.substitutos.load();
    return items.map((item) => {
      const usuario = item as unknown as Record<string, unknown>;
      const { usaEquipe, finalCodigoPa } = this.getSubstitutoPivotValues(usuario);
      return {
        id: usuario.id as number,
        usa_equipe_acervo_substituto: usaEquipe,
        final_codigo_pa: finalCodigoPa
      };
    });
  }

  private async criaFila(session: any, substitutoIds: number[]): Promise<FilaCircular | null> {
    if (!substitutoIds.length) return null;

    const fila = new FilaCircular();
    fila.ultimo_elemento = Math.min(...substitutoIds);

    await session.persist(fila);
    await session.commit();

    return fila;
  }

  private async getTipoDivisaoFinalProcessoId(session: any): Promise<number | null> {
    if (this.tipoDivisaoFinalProcessoId !== undefined) {
      return this.tipoDivisaoFinalProcessoId;
    }

    const ref = entityRef(TipoDivisaoCargaTrabalho);
    const [row] = await selectFromEntity(TipoDivisaoCargaTrabalho)
      .select({ id: ref.id })
      .where(eq(ref.nome, FINAL_DE_PROCESSO_NOME))
      .executePlain(session);

    this.tipoDivisaoFinalProcessoId = (row?.id as number | undefined) ?? null;
    return this.tipoDivisaoFinalProcessoId;
  }

  private async getUsuarioAfastadoInfo(
    session: any,
    usuarioId: number
  ): Promise<{ cargo?: string; vinculo?: string | null; lotacao?: string | null } | null> {
    const usuarioRef = entityRef(Usuario);
    const rows = (await selectFromEntity(Usuario)
      .select({
        id: usuarioRef.id,
        cargo: usuarioRef.cargo,
        vinculo: usuarioRef.vinculo,
        especializada_id: usuarioRef.especializada_id
      })
      .where(eq(usuarioRef.id, usuarioId))
      .executePlain(session)) as Array<{
      id: number;
      cargo?: string;
      vinculo?: string | null;
      especializada_id?: number | null;
    }>;

    const usuario = rows[0];
    if (!usuario) return null;

    let lotacao: string | null = null;
    if (usuario.especializada_id) {
      const espRef = entityRef(Especializada);
      const [especializada] = (await selectFromEntity(Especializada)
        .select({ nome: espRef.nome })
        .where(eq(espRef.id, usuario.especializada_id as number))
        .executePlain(session)) as Array<{ nome?: string }>;
      lotacao = (especializada?.nome as string | undefined) ?? null;
    }

    return {
      cargo: usuario.cargo as string | undefined,
      vinculo: (usuario.vinculo as string | undefined) ?? null,
      lotacao
    };
  }

  private async mapDetail(detail: Record<string, unknown>): Promise<AfastamentoPessoaDetailDto> {
    return (await this.mapListItem(detail)) as AfastamentoPessoaDetailDto;
  }

  private async mapListItem(detail: Record<string, unknown>): Promise<Record<string, unknown>> {
    const substitutos = await this.mapSubstitutos(detail.substitutos);
    const base = this.toPlainEntity(detail) as Record<string, unknown>;
    return {
      ...base,
      usuario: await this.resolveSingleRelation(detail.usuario),
      tipoAfastamento: await this.resolveSingleRelation(detail.tipoAfastamento),
      tipoDivisaoCargaTrabalho: await this.resolveSingleRelation(detail.tipoDivisaoCargaTrabalho),
      filaCircular: await this.resolveSingleRelation(detail.filaCircular),
      substitutos
    };
  }

  private async mapSubstitutos(raw: unknown): Promise<AfastamentoPessoaSubstitutoDto[]> {
    const items = await this.coerceToArray(raw);
    if (!items.length) return [];
    return items.map((usuario) => this.mapSubstituto(usuario as Record<string, unknown>));
  }

  private mapSubstituto(usuario: Record<string, unknown>): AfastamentoPessoaSubstitutoDto {
    const { usaEquipe, finalCodigoPa } = this.getSubstitutoPivotValues(usuario);

    return {
      id: usuario.id as number,
      nome: usuario.nome as string,
      cargo: usuario.cargo as string | undefined,
      vinculo: usuario.vinculo as string | undefined,
      especializada: usuario.especializada as Record<string, unknown> | undefined,
      usa_equipe_acervo_substituto: usaEquipe,
      final_codigo_pa: finalCodigoPa
    } as AfastamentoPessoaSubstitutoDto;
  }

  private getSubstitutoPivotValues(
    usuario: Record<string, unknown>
  ): { usaEquipe?: boolean; finalCodigoPa?: string | null } {
    const pivot = (usuario._pivot as Record<string, unknown> | undefined) ?? {};
    const usaEquipe =
      usuario.usa_equipe_acervo_substituto !== undefined
        ? usuario.usa_equipe_acervo_substituto
        : pivot.usa_equipe_acervo_substituto;
    const finalCodigoPa =
      usuario.final_codigo_pa !== undefined
        ? usuario.final_codigo_pa
        : pivot.final_codigo_pa;

    return {
      usaEquipe: usaEquipe as boolean | undefined,
      finalCodigoPa: (finalCodigoPa as string | null | undefined) ?? null
    };
  }

  private async coerceToArray(value: unknown): Promise<unknown[]> {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === "object") {
      const wrapper = value as { load?: () => Promise<unknown[]>; getItems?: () => unknown[] };
      if (typeof wrapper.load === "function") {
        return await wrapper.load();
      }
      if (typeof wrapper.getItems === "function") {
        return wrapper.getItems();
      }
      if (Symbol.iterator in wrapper) {
        return Array.from(wrapper as Iterable<unknown>);
      }
    }
    return [];
  }

  private async resolveSingleRelation(value: unknown): Promise<unknown> {
    if (!value || typeof value !== "object") return value;
    const wrapper = value as { load?: () => Promise<unknown>; get?: () => unknown };
    if (typeof wrapper.get === "function") {
      const existing = wrapper.get();
      if (existing) {
        return this.toPlainEntity(existing);
      }
    }
    if (typeof wrapper.load === "function") {
      const loaded = await wrapper.load();
      return this.toPlainEntity(loaded);
    }
    return this.toPlainEntity(value);
  }

  private toPlainEntity(
    value: unknown,
    options: { includeAllRelations?: boolean } = { includeAllRelations: false }
  ): unknown {
    if (!value || typeof value !== "object") return value;
    const entity = value as { toJSON?: (options?: { includeAllRelations?: boolean }) => unknown };
    if (typeof entity.toJSON === "function") {
      return entity.toJSON(options);
    }
    return value;
  }

}
