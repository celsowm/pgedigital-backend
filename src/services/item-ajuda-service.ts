import { type Jsonify, type OrmSession } from 'metal-orm';
import { ItemAjuda } from '../entities/index.js';
import * as itemAjudaRepository from '../repositories/item-ajuda-repository.js';
import {
  validateItemAjudaCreateInput,
  validateItemAjudaUpdateInput,
} from '../validators/item-ajuda-validators.js';
import { BaseEntityService } from './base-entity-service.js';
import type { CreateInput, EntityResponse, ListQuery, PagedResponse, UpdateInput } from './service-types.js';

export type ItemAjudaCreateInput = CreateInput<
  Jsonify<ItemAjuda>,
  'identificador' | 'html'
>;

export type ItemAjudaUpdateInput = UpdateInput<ItemAjudaCreateInput>;

export type ItemAjudaListQuery = ListQuery<{ identificador?: string }>;

export type ItemAjudaResponse = EntityResponse<ItemAjuda>;

export type ItemAjudaListResponse = PagedResponse<ItemAjudaResponse>;

class ItemAjudaService extends BaseEntityService<
  ItemAjuda,
  ItemAjudaCreateInput,
  ItemAjudaUpdateInput,
  ItemAjudaListQuery,
  { identificador?: string }
> {
  constructor() {
    super({
      entityName: ItemAjuda.name,
      repository: {
        listPaged: (session, filters, paging) =>
          itemAjudaRepository.listItemAjudaEntitiesPaged(session, filters, paging),
        findById: (session, id) => itemAjudaRepository.findItemAjudaById(session, id),
      },
      validators: {
        validateCreate: validateItemAjudaCreateInput,
        validateUpdate: validateItemAjudaUpdateInput,
      },
      entityClass: ItemAjuda,
    });
  }

  protected getBaseFilters(query?: ItemAjudaListQuery): { identificador?: string } {
    return { identificador: query?.identificador };
  }
}

const itemAjudaService = new ItemAjudaService();

export async function listItemAjuda(
  session: OrmSession,
  query?: ItemAjudaListQuery,
): Promise<ItemAjudaListResponse> {
  return itemAjudaService.list(session, query);
}

export async function getItemAjuda(
  session: OrmSession,
  id: number,
): Promise<ItemAjudaResponse> {
  return itemAjudaService.get(session, id);
}

export async function createItemAjuda(
  session: OrmSession,
  input: ItemAjudaCreateInput,
): Promise<ItemAjudaResponse> {
  return itemAjudaService.create(session, input);
}

export async function updateItemAjuda(
  session: OrmSession,
  id: number,
  input: ItemAjudaUpdateInput,
): Promise<ItemAjudaResponse> {
  return itemAjudaService.update(session, id, input);
}

export async function deleteItemAjuda(
  session: OrmSession,
  id: number,
): Promise<void> {
  return itemAjudaService.delete(session, id);
}
