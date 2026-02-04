import { parseFilter, parsePagination } from "adorn-api";
import {
  applyFilter,
  entityRef,
  getColumn,
  toPagedResponse,
  type ColumnDef,
  type OrmSession
} from "metal-orm";
import { withSession } from "../db/mssql";
import { parseSorting, type SortingConfig } from "../utils/controller-helpers";
import type { BaseRepository, FilterMapping } from "../repositories/base.repository";

type SortDirection = "ASC" | "DESC";

export interface ListConfig<TEntity extends object, TFilterFields extends string> {
  filterMappings: FilterMapping<TFilterFields>;
  sortableColumns?: (keyof TEntity & string)[];
  defaultSortBy?: keyof TEntity & string;
  defaultSortOrder?: SortDirection;
}

export abstract class BaseService<
  TEntity extends object,
  TFilterFields extends string = string,
  TQuery extends object = Record<string, unknown>
> {
  protected abstract readonly repository: BaseRepository<TEntity>;
  protected abstract readonly listConfig: ListConfig<TEntity, TFilterFields>;

  async list(query: TQuery): Promise<unknown> {
    const paginationQuery = (query ?? {}) as Record<string, unknown>;
    const { page, pageSize } = parsePagination(paginationQuery);
    const filters = parseFilter(
      paginationQuery,
      this.listConfig.filterMappings as Parameters<typeof parseFilter>[1]
    );

    const sortingConfig: SortingConfig = {
      defaultSortBy: this.listConfig.defaultSortBy ?? "id",
      defaultSortOrder: this.listConfig.defaultSortOrder ?? "ASC",
      allowedColumns: this.listConfig.sortableColumns
    };
    const { sortBy, sortOrder } = parseSorting(paginationQuery, sortingConfig);

    return withSession(async (session: OrmSession) => {
      const baseQuery = this.repository.buildListQuery();
      let filteredQuery = applyFilter(baseQuery, this.repository.entityClass, filters);

      if (sortBy) {
        const ref = entityRef(this.repository.entityClass);
        const sortColumn = getColumn(ref, sortBy) as ColumnDef;
        filteredQuery = filteredQuery.orderBy(sortColumn, sortOrder);
        if (sortBy !== "id") {
          const idColumn = getColumn(ref, "id") as ColumnDef;
          filteredQuery = filteredQuery.orderBy(idColumn, "ASC");
        }
      }

      const paged = await filteredQuery.executePaged(session, { page, pageSize });
      return toPagedResponse(paged);
    });
  }

  async listOptions(
    query: TQuery,
    labelField?: keyof TEntity
  ): Promise<Array<{ id: number; nome: string }>> {
    const paginationQuery = (query ?? {}) as Record<string, unknown>;
    const filters = parseFilter(
      paginationQuery,
      this.listConfig.filterMappings as Parameters<typeof parseFilter>[1]
    );

    return withSession(async (session: OrmSession) => {
      let optionsQuery = this.repository.buildOptionsQuery(labelField);
      if (filters) {
        optionsQuery = applyFilter(optionsQuery, this.repository.entityClass, filters);
      }
      return optionsQuery.executePlain(session) as unknown as Array<{ id: number; nome: string }>;
    });
  }
}
