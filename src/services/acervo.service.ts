import { HttpError, applyInput, parseFilter, parsePagination } from "adorn-api";
import {
  applyFilter,
  entityRef,
  getColumn,
  toPagedResponse,
  type ColumnDef
} from "metal-orm";
import { withSession } from "../db/mssql";
import { Acervo } from "../entities/Acervo";
import { Usuario } from "../entities/Usuario";
import type {
  AcervoDetailDto,
  AcervoQueryDto,
  CreateAcervoDto,
  ReplaceAcervoDto,
  UpdateAcervoDto
} from "../dtos/acervo/acervo.dtos";
import {
  AcervoRepository,
  ACERVO_FILTER_MAPPINGS,
  PROCURADOR_TITULAR_FILTER_MAPPINGS,
  type AcervoFilterFields,
  type ProcuradorTitularFilterFields
} from "../repositories/acervo.repository";
import { BaseService, type ListConfig } from "./base.service";
import { parseSorting } from "../utils/controller-helpers";

const SORTABLE_COLUMNS = ["id", "nome", "ativo", "created", "modified"] as const;

export class AcervoService extends BaseService<Acervo, AcervoFilterFields, AcervoQueryDto> {
  protected readonly repository: AcervoRepository;
  protected readonly listConfig: ListConfig<Acervo, AcervoFilterFields> = {
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
    const procuradorTitularFilters = parseFilter<Usuario, ProcuradorTitularFilterFields>(
      paginationQuery,
      PROCURADOR_TITULAR_FILTER_MAPPINGS
    );
    const { page, pageSize } = parsePagination(paginationQuery);
    const filters = parseFilter<Acervo, AcervoFilterFields>(
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
        filters
      );

      if (procuradorTitularFilters) {
        queryBuilder = queryBuilder.whereHas("procuradorTitular", (qb) =>
          applyFilter(qb, Usuario, procuradorTitularFilters)
        );
      }

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
    const procuradorTitularFilters = parseFilter<Usuario, ProcuradorTitularFilterFields>(
      paginationQuery,
      PROCURADOR_TITULAR_FILTER_MAPPINGS
    );
    const filters = parseFilter<Acervo, AcervoFilterFields>(
      paginationQuery,
      ACERVO_FILTER_MAPPINGS
    );

    return withSession(async (session) => {
      let optionsQuery = this.repository.buildOptionsQuery(labelField);
      if (filters) {
        optionsQuery = applyFilter(optionsQuery, this.repository.entityClass, filters);
      }
      if (procuradorTitularFilters) {
        optionsQuery = optionsQuery.whereHas("procuradorTitular", (qb) =>
          applyFilter(qb, Usuario, procuradorTitularFilters)
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
      const acervo = new Acervo();
      applyInput(acervo, input as Partial<Acervo>, { partial: false });
      await session.persist(acervo);
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
      applyInput(acervo, input as Partial<Acervo>, { partial: false });
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
      applyInput(acervo, input as Partial<Acervo>, { partial: true });
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
}
