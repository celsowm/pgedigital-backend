import { jsonify, type Jsonify, type OrmSession } from 'metal-orm';
import { NotaVersao } from '../entities/index.js';
import {
  listNotaVersaoEntitiesPaged,
  findNotaVersaoById,
  softDeleteNotaVersaoEntity,
  deactivateNotaVersaoEntity,
  deactivateOtherVersionsForSprint,
  activateNotaVersaoEntity,
} from '../repositories/nota-versao-repository.js';
import {
  validateNotaVersaoCreateInput,
  validateNotaVersaoUpdateInput,
} from '../validators/nota-versao-validators.js';
import { NotFoundError } from '../errors/http-error.js';
import { applyUpdates, commitAndMap, getByIdOrThrow, listPaged, saveGraphAndCommit } from './service-utils.js';
import type { CreateInput, EntityResponse, ListQuery, PagedResponse, UpdateInput } from './service-types.js';

export type NotaVersaoCreateInput = CreateInput<
  Jsonify<NotaVersao>,
  'data' | 'sprint' | 'mensagem',
  'ativo'
>;

export type NotaVersaoUpdateInput = UpdateInput<NotaVersaoCreateInput>;

export type NotaVersaoListQuery = ListQuery<{
  sprint?: number;
  ativo?: boolean;
  includeInactive?: boolean;
  includeDeleted?: boolean;
}>;

export type NotaVersaoResponse = EntityResponse<NotaVersao>;

export type NotaVersaoListResponse = PagedResponse<NotaVersaoResponse>;

const toResponse = (entity: NotaVersao): NotaVersaoResponse => jsonify(entity);

export async function listNotaVersao(
  session: OrmSession,
  query?: NotaVersaoListQuery,
): Promise<NotaVersaoListResponse> {
  const baseFilters = {
    sprint: query?.sprint,
    ativo: query?.ativo,
    includeInactive: query?.includeInactive,
    includeDeleted: query?.includeDeleted,
  };

  return listPaged(session, listNotaVersaoEntitiesPaged, baseFilters, query, toResponse);
}

export async function getNotaVersao(
  session: OrmSession,
  id: number,
): Promise<NotaVersaoResponse> {
  const entity = await getByIdOrThrow(session, id, findNotaVersaoById, () => {
    return new NotFoundError(`NotaVersao ${id} not found`);
  });

  return toResponse(entity);
}

export async function createNotaVersao(
  session: OrmSession,
  input: NotaVersaoCreateInput,
): Promise<NotaVersaoResponse> {
  const validated = validateNotaVersaoCreateInput(input);

  // If activating, deactivate other versions for the sprint first
  if (validated.ativo) {
    await deactivateOtherVersionsForSprint(session, validated.sprint);
  }

  const entity = await saveGraphAndCommit(session, NotaVersao, validated);

  return toResponse(entity);
}

export async function updateNotaVersao(
  session: OrmSession,
  id: number,
  input: NotaVersaoUpdateInput,
): Promise<NotaVersaoResponse> {
  const entity = await getByIdOrThrow(session, id, findNotaVersaoById, () => {
    return new NotFoundError(`NotaVersao ${id} not found`);
  });

  const validated = validateNotaVersaoUpdateInput(input);

  const previousSprint = entity.sprint;

  // Update entity properties - Metal-ORM tracks changes automatically
  applyUpdates(entity, validated, ['data', 'sprint', 'mensagem']);

  const sprintChanged = validated.sprint !== undefined && validated.sprint !== previousSprint;

  // Handle activation/deactivation logic
  if (validated.ativo === true) {
    await deactivateOtherVersionsForSprint(session, entity.sprint, entity.id);
    activateNotaVersaoEntity(entity);
  } else if (validated.ativo === false) {
    deactivateNotaVersaoEntity(entity);
  } else if (sprintChanged && entity.ativo) {
    await deactivateOtherVersionsForSprint(session, entity.sprint, entity.id);
  }

  return commitAndMap(session, entity, toResponse);
}

export async function deleteNotaVersao(
  session: OrmSession,
  id: number,
): Promise<void> {
  const entity = await getByIdOrThrow(session, id, findNotaVersaoById, () => {
    return new NotFoundError(`NotaVersao ${id} not found`);
  });

  // Soft delete the entity (mutates the tracked entity)
  softDeleteNotaVersaoEntity(entity);

  // Commit flushes the UPDATE automatically
  await session.commit();
}
