import { HttpError, parseFilter, parsePagination } from "adorn-api";
import {
  applyFilter,
  entityRef,
  getColumn,
  toPagedResponse,
  type ColumnDef,
  type WhereInput
} from "metal-orm";
import { withSession } from "../db/mssql";
import { Especializada } from "../entities/Especializada";
import { Usuario } from "../entities/Usuario";
import type {
  CreateEspecializadaDto,
  EspecializadaQueryDto,
  EspecializadaWithResponsavelDto,
  ReplaceEspecializadaDto,
  UpdateEspecializadaDto
} from "../dtos/especializada/especializada.dtos";
import {
  EspecializadaRepository,
  ESPECIALIZADA_FILTER_MAPPINGS,
  RESPONSAVEL_FILTER_MAPPINGS
} from "../repositories/especializada.repository";
import { BaseService, type ListConfig } from "./base.service";
import { parseSorting } from "../utils/controller-helpers";

const SORTABLE_COLUMNS = ["id", "nome", "sigla", "codigo_ad"] as const;

export class EspecializadaService extends BaseService<
  Especializada,
  EspecializadaQueryDto,
  EspecializadaWithResponsavelDto,
  CreateEspecializadaDto,
  ReplaceEspecializadaDto,
  UpdateEspecializadaDto
> {
  protected readonly repository: EspecializadaRepository;
  protected readonly listConfig: ListConfig<Especializada> = {
    filterMappings: ESPECIALIZADA_FILTER_MAPPINGS,
    sortableColumns: [...SORTABLE_COLUMNS],
    defaultSortBy: "id",
    defaultSortOrder: "ASC"
  };
  protected readonly entityName = "especializada";

  constructor(repository?: EspecializadaRepository) {
    super();
    this.repository = repository ?? new EspecializadaRepository();
  }

  override async list(query: EspecializadaQueryDto): Promise<unknown> {
    const paginationQuery = (query ?? {}) as Record<string, unknown>;
    const responsavelFilters = parseFilter(
      paginationQuery,
      RESPONSAVEL_FILTER_MAPPINGS
    );
    const { page, pageSize } = parsePagination(paginationQuery);
    const filters = parseFilter(
      paginationQuery,
      ESPECIALIZADA_FILTER_MAPPINGS
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

      if (responsavelFilters) {
        queryBuilder = queryBuilder.whereHas("responsavel", (qb) =>
          applyFilter(qb, Usuario, responsavelFilters as WhereInput<typeof Usuario>)
        );
      }

      if (sortBy) {
        const ref = entityRef(Especializada);
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

  async listSiglas(): Promise<string[]> {
    return withSession((session) => this.repository.listSiglas(session));
  }
}
