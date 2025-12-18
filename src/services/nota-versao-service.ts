import { jsonify, type OrmSession } from 'metal-orm';
import { NotaVersao } from '../entities/index.js';
import {
  listNotaVersaoEntities,
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
import { normalizePage, normalizePageSize } from '../validators/pagination-validators.js';
import { NotFoundError } from '../errors/http-error.js';
import { buildPaginationMeta, type PaginationMeta, type PaginationQuery } from '../models/pagination.js';
import { assertExists } from './service-utils.js';

export interface NotaVersaoCreateInput {
  data: string;
  sprint: number;
  mensagem: string;
  ativo?: boolean;
}

export interface NotaVersaoUpdateInput {
  data?: string;
  sprint?: number;
  mensagem?: string;
  ativo?: boolean;
}

export interface NotaVersaoListQuery extends PaginationQuery {
  sprint?: number;
  ativo?: boolean;
  includeInactive?: boolean;
  includeDeleted?: boolean;
}

// Use the entity type to derive the response interface
export interface NotaVersaoResponse {
  id: number;
  data: string;
  sprint: number;
  ativo: boolean;
  mensagem: string;
  data_exclusao?: string;
  data_inativacao?: string;
}

export interface NotaVersaoListResponse {
  items: NotaVersaoResponse[];
  pagination: PaginationMeta;
}

const toResponse = (entity: NotaVersao): NotaVersaoResponse => jsonify(entity);

export async function listNotaVersao(
  session: OrmSession,
  query?: NotaVersaoListQuery,
): Promise<NotaVersaoListResponse> {
  const page = normalizePage(query?.page);
  const pageSize = normalizePageSize(query?.pageSize);
  const baseFilters = {
    sprint: query?.sprint,
    ativo: query?.ativo,
    includeInactive: query?.includeInactive,
    includeDeleted: query?.includeDeleted,
  };

  const { items, totalItems } = await listNotaVersaoEntitiesPaged(session, baseFilters, {
    page,
    pageSize,
  });

  return {
    items: items.map(toResponse),
    pagination: buildPaginationMeta(page, pageSize, totalItems),
  };
}

export async function getNotaVersao(
  session: OrmSession,
  id: number,
): Promise<NotaVersaoResponse> {
  const entity = assertExists(
    await findNotaVersaoById(session, id),
    new NotFoundError(`NotaVersao ${id} not found`),
  );

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

  const entity = await session.saveGraph(
    NotaVersao,
    {
      data: validated.data,
      sprint: validated.sprint,
      mensagem: validated.mensagem,
      ativo: validated.ativo,
    },
    { transactional: false },
  );

  // Commit flushes the INSERT automatically
  await session.commit();

  return toResponse(entity);
}

export async function updateNotaVersao(
  session: OrmSession,
  id: number,
  input: NotaVersaoUpdateInput,
): Promise<NotaVersaoResponse> {
  const entity = assertExists(
    await findNotaVersaoById(session, id),
    new NotFoundError(`NotaVersao ${id} not found`),
  );

  const validated = validateNotaVersaoUpdateInput(input);

  const previousSprint = entity.sprint;

  // Update entity properties - Metal-ORM tracks changes automatically
  if (validated.data !== undefined) {
    entity.data = validated.data;
  }

  if (validated.sprint !== undefined) {
    entity.sprint = validated.sprint;
  }

  if (validated.mensagem !== undefined) {
    entity.mensagem = validated.mensagem;
  }

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

  // Commit flushes the UPDATE automatically
  await session.commit();

  return toResponse(entity);
}

export async function deleteNotaVersao(
  session: OrmSession,
  id: number,
): Promise<void> {
  const entity = assertExists(
    await findNotaVersaoById(session, id),
    new NotFoundError(`NotaVersao ${id} not found`),
  );

  // Soft delete the entity (mutates the tracked entity)
  softDeleteNotaVersaoEntity(entity);

  // Commit flushes the UPDATE automatically
  await session.commit();
}
