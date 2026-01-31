import {
  parseFilter,
  parsePagination,
  type RequestContext
} from "adorn-api";
import {
  applyFilter,
  selectFromEntity,
  toPagedResponse,
  type OrmSession
} from "metal-orm";
import { withSession } from "../db/mssql";

/**
 * Base controller class providing common CRUD operations
 * for entities with pagination and filtering support.
 */
export abstract class BaseController<TEntity, TFilterFields extends keyof TEntity> {
  /**
   * The entity class to operate on
   */
  abstract get entityClass(): any;

  /**
   * Entity reference for query building
   */
  abstract get entityRef(): any;

  /**
   * Filter mappings for query parameters
   */
  abstract get filterMappings(): Record<string, { field: TFilterFields; operator: "equals" | "contains" }>;

  /**
   * Human-readable entity name for error messages
   */
  abstract get entityName(): string;

  /**
   * Field used as label for options list
   */
  protected get optionsLabelField(): string {
    return "nome";
  }

  /**
   * Build the base query with optional customization
   */
  protected buildQuery(queryBuilder?: (qb: any) => any) {
    let query = selectFromEntity(this.entityClass).orderBy(this.entityRef.id, "ASC");
    return queryBuilder ? queryBuilder(query) : query;
  }

  /**
   * Generic list endpoint handler with pagination and filtering
   */
  async list(
    ctx: RequestContext<unknown, any>,
    queryBuilder?: (qb: any) => any
  ): Promise<unknown> {
    const paginationQuery = (ctx.query ?? {}) as Record<string, unknown>;
    const { page, pageSize } = parsePagination(paginationQuery);
    const filters = parseFilter<TEntity, TFilterFields>(paginationQuery, this.filterMappings);

    return withSession(async (session) => {
      const query = applyFilter(this.buildQuery(queryBuilder), this.entityClass, filters);
      const paged = await query.executePaged(session, { page, pageSize });
      return toPagedResponse(paged);
    });
  }

  /**
   * Generic delete endpoint handler
   */
  async delete(session: OrmSession, id: number): Promise<void> {
    const entity = await session.find(this.entityClass, id);
    if (!entity) {
      const { HttpError } = await import("adorn-api");
      throw new HttpError(404, `${this.entityName} not found.`);
    }
    await session.remove(entity);
    await session.commit();
  }

  /**
   * Generic options endpoint handler (returns id and name only)
   */
  async listOptions(
    ctx?: RequestContext<unknown, any>,
    queryBuilder?: (qb: any) => any
  ): Promise<Array<{ id: number; nome: string }>> {
    const labelField = this.optionsLabelField;
    const labelRef = (this.entityRef as any)[labelField];
    const paginationQuery = (ctx?.query ?? {}) as Record<string, unknown>;
    const filters = parseFilter<TEntity, TFilterFields>(paginationQuery, this.filterMappings);

    return withSession((session) => {
      let query = (selectFromEntity(this.entityClass) as any)
        .select({ id: this.entityRef.id, nome: labelRef })
        .orderBy(labelRef, "ASC");

      if (queryBuilder) {
        query = queryBuilder(query);
      }

      if (filters) {
        query = applyFilter(query, this.entityClass, filters);
      }

      return query.executePlain(session);
    });
  }

  /**
   * Get entity by ID or throw 404
   */
  protected async getEntityOrThrow(session: OrmSession, id: number): Promise<TEntity> {
    const entity = await session.find(this.entityClass, id);
    if (!entity) {
      const { HttpError } = await import("adorn-api");
      throw new HttpError(404, `${this.entityName} not found.`);
    }
    return entity;
  }
}
