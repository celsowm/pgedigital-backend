import { jsonify, type Jsonify, type OrmSession } from 'metal-orm';
import { ItemAjuda } from '../entities/index.js';
import {
  findItemAjudaById,
  listItemAjudaEntitiesPaged,
} from '../repositories/item-ajuda-repository.js';
import {
  validateItemAjudaCreateInput,
  validateItemAjudaUpdateInput,
} from '../validators/item-ajuda-validators.js';
import { NotFoundError } from '../errors/http-error.js';
import { applyUpdates, commitAndMap, getByIdOrThrow, listPaged, saveGraphAndCommit } from './service-utils.js';
import type { CreateInput, EntityResponse, ListQuery, PagedResponse, UpdateInput } from './service-types.js';

export type ItemAjudaCreateInput = CreateInput<
  Jsonify<ItemAjuda>,
  'identificador' | 'html'
>;

export type ItemAjudaUpdateInput = UpdateInput<ItemAjudaCreateInput>;

export type ItemAjudaListQuery = ListQuery<{ identificador?: string }>;

export type ItemAjudaResponse = EntityResponse<ItemAjuda>;

export type ItemAjudaListResponse = PagedResponse<ItemAjudaResponse>;

const toResponse = (entity: ItemAjuda): ItemAjudaResponse => jsonify(entity);

export async function listItemAjuda(
  session: OrmSession,
  query?: ItemAjudaListQuery,
): Promise<ItemAjudaListResponse> {
  const baseFilters = { identificador: query?.identificador };

  return listPaged(session, listItemAjudaEntitiesPaged, baseFilters, query, toResponse);
}

export async function getItemAjuda(
  session: OrmSession,
  id: number,
): Promise<ItemAjudaResponse> {
  const entity = await getByIdOrThrow(session, id, findItemAjudaById, () => {
    return new NotFoundError(`ItemAjuda ${id} not found`);
  });

  return toResponse(entity);
}

export async function createItemAjuda(
  session: OrmSession,
  input: ItemAjudaCreateInput,
): Promise<ItemAjudaResponse> {
  const validated = validateItemAjudaCreateInput(input);

  const entity = await saveGraphAndCommit(session, ItemAjuda, validated);

  return toResponse(entity);
}

export async function updateItemAjuda(
  session: OrmSession,
  id: number,
  input: ItemAjudaUpdateInput,
): Promise<ItemAjudaResponse> {
  const entity = await getByIdOrThrow(session, id, findItemAjudaById, () => {
    return new NotFoundError(`ItemAjuda ${id} not found`);
  });

  const validated = validateItemAjudaUpdateInput(input);

  applyUpdates(entity, validated);

  return commitAndMap(session, entity, toResponse);
}

export async function deleteItemAjuda(
  session: OrmSession,
  id: number,
): Promise<void> {
  const entity = await getByIdOrThrow(session, id, findItemAjudaById, () => {
    return new NotFoundError(`ItemAjuda ${id} not found`);
  });

  await session.remove(entity);
  await session.commit();
}
