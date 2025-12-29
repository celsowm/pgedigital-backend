import type { OrmSession } from 'metal-orm';
import type { BaseEntityService } from '../services/base-entity-service.js';
import type { PagedResponse } from '../services/service-types.js';

export class BaseCrudController<
  TEntity extends object,
  TCreateInput extends object,
  TUpdateInput extends object,
  TListQuery,
> {
  constructor(
    protected readonly session: OrmSession,
    protected readonly service: BaseEntityService<TEntity, TCreateInput, TUpdateInput, TListQuery, any, any, any>,
    protected readonly entityLabel: string,
  ) {}

  async list(query: TListQuery): Promise<PagedResponse<TEntity>> {
    return this.service.list(this.session, query);
  }

  async find(id: number): Promise<TEntity> {
    return this.service.get(this.session, id);
  }

  async create(body: TCreateInput): Promise<TEntity> {
    return this.service.create(this.session, body);
  }

  async update(id: number, body: TUpdateInput): Promise<TEntity> {
    return this.service.update(this.session, id, body);
  }

  async remove(id: number): Promise<{ success: true; message: string }> {
    await this.service.delete(this.session, id);
    return { success: true, message: `${this.entityLabel} ${id} deleted` };
  }
}
