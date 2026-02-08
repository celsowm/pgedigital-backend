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
import { Carga } from "../entities/Carga";
import type { CaixaEntradaQueryDto, CaixaEntradaDto } from "../dtos/caixa-entrada/caixa-entrada.dtos";
import {
  CaixaEntradaRepository,
  CAIXA_ENTRADA_FILTER_MAPPINGS
} from "../repositories/caixa-entrada.repository";
import { parseSorting } from "../utils/controller-helpers";

const SORTABLE_COLUMNS = ["id", "lido"] as const;

export class CaixaEntradaService {
  private readonly repository: CaixaEntradaRepository;
  private readonly sortableColumns = [...SORTABLE_COLUMNS];
  private readonly defaultSortBy = "id";
  private readonly defaultSortOrder = "DESC" as const; // Most recent first
  private readonly entityName = "caixa-entrada";

  constructor(repository?: CaixaEntradaRepository) {
    this.repository = repository ?? new CaixaEntradaRepository();
  }

  async list(query: CaixaEntradaQueryDto): Promise<unknown> {
    // Validate that usuarioId is provided
    if (!query.usuarioId) {
      throw new HttpError(400, "usuarioId is required.");
    }

    const paginationQuery = (query ?? {}) as unknown as Record<string, unknown>;
    const { page, pageSize } = parsePagination(paginationQuery);
    const filters = parseFilter(paginationQuery, CAIXA_ENTRADA_FILTER_MAPPINGS);

    const { sortBy, sortOrder } = parseSorting(paginationQuery, {
      defaultSortBy: this.defaultSortBy,
      defaultSortOrder: this.defaultSortOrder,
      allowedColumns: this.sortableColumns
    });

    return withSession(async (session) => {
      let queryBuilder = applyFilter(
        this.repository.buildListQuery(),
        this.repository.entityClass,
        filters as WhereInput<typeof this.repository.entityClass>
      );

      if (sortBy) {
        const ref = entityRef(Carga);
        const sortColumn = getColumn(ref, sortBy) as ColumnDef;
        queryBuilder = queryBuilder.orderBy(sortColumn, sortOrder);
        if (sortBy !== "id") {
          const idColumn = getColumn(ref, "id") as ColumnDef;
          queryBuilder = queryBuilder.orderBy(idColumn, "DESC");
        }
      }

      const paged = await queryBuilder.executePaged(session, { page, pageSize });
      return toPagedResponse(paged);
    });
  }

  async getOne(id: number, usuarioId: number): Promise<CaixaEntradaDto> {
    return withSession(async (session) => {
      const detail = await this.repository.getDetail(session, id);
      if (!detail) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      // Verify that the carga belongs to the user
      if (detail.usuario_id !== usuarioId) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      return detail;
    });
  }
}