import type { Jsonify } from 'metal-orm';
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

export const itemAjudaService = new BaseEntityService<
  ItemAjuda,
  ItemAjudaCreateInput,
  ItemAjudaUpdateInput,
  ItemAjudaListQuery,
  { identificador?: string }
>({
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
  getBaseFilters: (query) => ({ identificador: query?.identificador }),
});
