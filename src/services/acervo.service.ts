import { HttpError, applyInput, parseFilter, parsePagination } from "adorn-api";
import {
  applyFilter,
  entityRef,
  getColumn,
  toPagedResponse,
  type ColumnDef,
  type ManyToManyCollection,
  type OrmSession,
  type WhereInput
} from "metal-orm";
import { withSession } from "../db/mssql";
import { Acervo } from "../entities/Acervo";
import type {
  AcervoDetailDto,
  AcervoQueryDto,
  CreateAcervoDto,
  ReplaceAcervoDto,
  UpdateAcervoDto,
  RaizCnpjInputDto
} from "../dtos/acervo/acervo.dtos";
import {
  AcervoRepository,
  ACERVO_FILTER_MAPPINGS,
  type AcervoFilterFields
} from "../repositories/acervo.repository";
import { BaseService, type ListConfig } from "./base.service";
import { parseSorting } from "../utils/controller-helpers";

const SORTABLE_COLUMNS = ["id", "nome", "ativo", "created", "modified"] as const;

export class AcervoService extends BaseService<Acervo, AcervoQueryDto> {
  protected readonly repository: AcervoRepository;
  protected readonly listConfig: ListConfig<Acervo> = {
    filterMappings: ACERVO_FILTER_MAPPINGS,
    sortableColumns: [...SORTABLE_COLUMNS],
    defaultSortBy: "id",
    defaultSortOrder: "ASC"
  };

  private readonly entityName = "acervo";

  constructor(repository?: AcervoRepository) {
    super();
    this.repository = repository ?? new AcervoRepository();
  }

  override async list(query: AcervoQueryDto): Promise<unknown> {
    const paginationQuery = (query ?? {}) as Record<string, unknown>;
    const { page, pageSize } = parsePagination(paginationQuery);
    const filters = parseFilter(
      paginationQuery,
      ACERVO_FILTER_MAPPINGS
    );

    const { sortBy, sortOrder } = parseSorting(paginationQuery, {
      defaultSortBy: this.listConfig.defaultSortBy ?? "id",
      defaultSortOrder: this.listConfig.defaultSortOrder ?? "ASC",
      allowedColumns: this.listConfig.sortableColumns
    });

    return withSession(async (session) => {
      let queryBuilder = applyFilter(
        this.repository.buildListQuery(),
        this.repository.entityClass,
        filters as WhereInput<typeof this.repository.entityClass>
      );

      if (sortBy) {
        const ref = entityRef(this.repository.entityClass);
        const sortColumn = getColumn(ref, sortBy) as ColumnDef;
        queryBuilder = queryBuilder.orderBy(sortColumn, sortOrder);
        if (sortBy !== "id") {
          const idColumn = getColumn(ref, "id") as ColumnDef;
          queryBuilder = queryBuilder.orderBy(idColumn, "ASC");
        }
      }

      const paged = await queryBuilder.executePaged(session, { page, pageSize });
      return toPagedResponse(paged);
    });
  }

  override async listOptions(
    query: AcervoQueryDto,
    labelField?: keyof Acervo
  ): Promise<Array<{ id: number; nome: string }>> {
    const paginationQuery = (query ?? {}) as Record<string, unknown>;
    const filters = parseFilter(
      paginationQuery,
      ACERVO_FILTER_MAPPINGS
    );

    return withSession(async (session) => {
      let optionsQuery = this.repository.buildOptionsQuery(labelField);
      if (filters) {
        optionsQuery = applyFilter(
          optionsQuery,
          this.repository.entityClass,
          filters as WhereInput<typeof this.repository.entityClass>
        );
      }
      return optionsQuery.executePlain(session) as unknown as Array<{ id: number; nome: string }>;
    });
  }
  async getOne(id: number): Promise<AcervoDetailDto> {
    return withSession(async (session) => {
      const acervo = await this.repository.getDetail(session, id);
      if (!acervo) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      return acervo;
    });
  }

  async create(input: CreateAcervoDto): Promise<AcervoDetailDto> {
    return withSession(async (session) => {
      const { classificacoes, temas, equipes_apoio, destinatarios, raizes_cnpjs, ...rest } =
        input as Record<string, unknown>;

      const acervo = new Acervo();
      applyInput(acervo, rest as Partial<Acervo>, { partial: false });
      await session.persist(acervo);
      await session.commit();

      await this.syncRelations(session, acervo, {
        classificacoes: classificacoes as number[] | undefined,
        temas: temas as number[] | undefined,
        equipes_apoio: equipes_apoio as number[] | undefined,
        destinatarios: destinatarios as number[] | undefined,
        raizes_cnpjs: raizes_cnpjs as RaizCnpjInputDto[] | undefined
      });
      await session.commit();

      const detail = await this.repository.getDetail(session, acervo.id);
      if (!detail) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      return detail;
    });
  }

  async replace(id: number, input: ReplaceAcervoDto): Promise<AcervoDetailDto> {
    return withSession(async (session) => {
      const acervo = await this.repository.findById(session, id);
      if (!acervo) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      const { classificacoes, temas, equipes_apoio, destinatarios, raizes_cnpjs, ...rest } =
        input as Record<string, unknown>;

      applyInput(acervo, rest as Partial<Acervo>, { partial: false });

      await this.syncRelations(session, acervo, {
        classificacoes: classificacoes as number[] | undefined,
        temas: temas as number[] | undefined,
        equipes_apoio: equipes_apoio as number[] | undefined,
        destinatarios: destinatarios as number[] | undefined,
        raizes_cnpjs: raizes_cnpjs as RaizCnpjInputDto[] | undefined
      }, { replace: true });
      await session.commit();

      const detail = await this.repository.getDetail(session, id);
      if (!detail) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      return detail;
    });
  }

  async update(id: number, input: UpdateAcervoDto): Promise<AcervoDetailDto> {
    return withSession(async (session) => {
      const acervo = await this.repository.findById(session, id);
      if (!acervo) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      const { classificacoes, temas, equipes_apoio, destinatarios, raizes_cnpjs, ...rest } =
        input as Record<string, unknown>;

      applyInput(acervo, rest as Partial<Acervo>, { partial: true });

      const hasRelations = classificacoes !== undefined || temas !== undefined ||
        equipes_apoio !== undefined || destinatarios !== undefined || raizes_cnpjs !== undefined;

      if (hasRelations) {
        await this.syncRelations(session, acervo, {
          classificacoes: classificacoes as number[] | undefined,
          temas: temas as number[] | undefined,
          equipes_apoio: equipes_apoio as number[] | undefined,
          destinatarios: destinatarios as number[] | undefined,
          raizes_cnpjs: raizes_cnpjs as RaizCnpjInputDto[] | undefined
        }, { replace: true });
      }
      await session.commit();

      const detail = await this.repository.getDetail(session, id);
      if (!detail) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      return detail;
    });
  }

  async remove(id: number): Promise<void> {
    return withSession(async (session) => {
      const acervo = await this.repository.findById(session, id);
      if (!acervo) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      await session.remove(acervo);
      await session.commit();
    });
  }

  private async syncRelations(
    session: OrmSession,
    acervo: Acervo,
    input: {
      classificacoes?: number[];
      temas?: number[];
      equipes_apoio?: number[];
      destinatarios?: number[];
      raizes_cnpjs?: RaizCnpjInputDto[];
    },
    options: { replace?: boolean } = {}
  ): Promise<void> {
    if (input.classificacoes !== undefined) {
      await this.syncIdCollection(acervo, "classificacoes", input.classificacoes, options.replace);
    }
    if (input.temas !== undefined) {
      await this.syncIdCollection(acervo, "temasRelacionados", input.temas, options.replace);
    }
    if (input.equipes_apoio !== undefined) {
      await this.syncIdCollection(acervo, "equipes", input.equipes_apoio, options.replace);
    }
    if (input.destinatarios !== undefined) {
      await this.syncIdCollection(acervo, "destinatarios", input.destinatarios, options.replace);
    }
    if (input.raizes_cnpjs !== undefined) {
      await this.syncRaizesCnpjs(acervo, input.raizes_cnpjs, options.replace);
    }
  }

  private async syncIdCollection(
    acervo: Acervo,
    relationName: "classificacoes" | "temasRelacionados" | "equipes" | "destinatarios",
    ids: number[],
    replace?: boolean
  ): Promise<void> {
    const collection = acervo[relationName] as ManyToManyCollection<unknown>;
    await collection.load();

    const incomingIds = new Set(ids.map(String));
    for (const id of ids) {
      collection.attach(id);
    }

    if (replace) {
      for (const existing of [...collection.getItems()]) {
        const existingId = (existing as Record<string, unknown>).id as number | string | undefined;
        if (existingId !== undefined && !incomingIds.has(String(existingId))) {
          collection.detach(existing);
        }
      }
    }
  }

  private async syncRaizesCnpjs(
    acervo: Acervo,
    items: RaizCnpjInputDto[],
    replace?: boolean
  ): Promise<void> {
    await acervo.raizesCNPJs.load();

    const incomingIds = new Set(items.map(item => String(item.id)));
    for (const item of items) {
      acervo.raizesCNPJs.attach(item.id, { raiz: item.raiz });
    }

    if (replace) {
      for (const existing of [...acervo.raizesCNPJs.getItems()]) {
        const existingId = (existing as unknown as Record<string, unknown>).id as number | string | undefined;
        if (existingId !== undefined && !incomingIds.has(String(existingId))) {
          acervo.raizesCNPJs.detach(existing);
        }
      }
    }
  }
}
