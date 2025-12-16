import { OrmSession } from 'metal-orm';
import { NotaVersao } from '../entities/index.js';
import {
  listNotaVersaoEntities,
  countNotaVersaoEntities,
  findNotaVersaoById,
  createNotaVersaoEntity,
  softDeleteNotaVersaoEntity,
  deactivateOtherVersionsForSprint,
  activateNotaVersaoEntity,
} from '../repositories/nota-versao-repository.js';
import {
  normalizePage,
  normalizePageSize,
  validateNotaVersaoCreateInput,
  validateNotaVersaoUpdateInput,
} from '../validators/nota-versao-validators.js';
import { NotFoundError } from '../errors/http-error.js';
import { buildPaginationMeta, type PaginationMeta, type PaginationQuery } from '../models/pagination.js';

// Helper type to convert entity to response format
type EntityToResponse<T> = {
  [K in keyof T]: T[K] extends Date ? string : T[K];
};

// Helper type to create input interfaces from entity
type EntityToCreateInput<T> = {
  [K in keyof T as K extends 'id' | 'data_exclusao' | 'data_inativacao' ? never : K]:
  T[K] extends Date ? string : (K extends 'ativo' ? T[K] | undefined : T[K]);
};

type EntityToUpdateInput<T> = {
  [K in keyof T as K extends 'id' | 'data_exclusao' | 'data_inativacao' ? never : K]?:
  T[K] extends Date ? string : T[K];
};

// Derive input interfaces from the entity to avoid duplication
export type NotaVersaoCreateInput = EntityToCreateInput<NotaVersao>;

export type NotaVersaoUpdateInput = EntityToUpdateInput<NotaVersao>;

export interface NotaVersaoListQuery extends PaginationQuery {
  sprint?: number;
  ativo?: boolean;
  includeInactive?: boolean;
  includeDeleted?: boolean;
}

// Use the entity type to derive the response interface
export type NotaVersaoResponse = EntityToResponse<NotaVersao>;

export interface NotaVersaoListResponse {
  items: NotaVersaoResponse[];
  pagination: PaginationMeta;
}

// Generic function to convert entity to response format
const toResponse = (entity: NotaVersao): NotaVersaoResponse => {
  const result: any = {};
  for (const key in entity) {
    const value = (entity as any)[key];
    if (value instanceof Date) {
      result[key] = value.toISOString();
    } else {
      result[key] = value;
    }
  }
  return result;
};

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

  // Execute sequentially to avoid concurrent requests on a single connection/session (Tedious).
  const rows = await listNotaVersaoEntities(session, {
    ...baseFilters,
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });
  const totalItems = await countNotaVersaoEntities(session, baseFilters);

  return {
    items: rows.map(toResponse),
    pagination: buildPaginationMeta(page, pageSize, totalItems),
  };
}

export async function getNotaVersao(
  session: OrmSession,
  id: number,
): Promise<NotaVersaoResponse> {
  const entity = await findNotaVersaoById(session, id);
  if (!entity) {
    throw new NotFoundError(`NotaVersao ${id} not found`);
  }

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

  // Create a new tracked entity using Metal-ORM Level 3 pattern
  const entity = createNotaVersaoEntity(session, {
    data: validated.data,
    sprint: validated.sprint,
    mensagem: validated.mensagem,
    ativo: validated.ativo,
  });

  // Commit flushes the INSERT automatically
  await session.commit();

  return toResponse(entity);
}

export async function updateNotaVersao(
  session: OrmSession,
  id: number,
  input: NotaVersaoUpdateInput,
): Promise<NotaVersaoResponse> {
  const entity = await findNotaVersaoById(session, id);
  if (!entity) {
    throw new NotFoundError(`NotaVersao ${id} not found`);
  }

  const validated = validateNotaVersaoUpdateInput(input);

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

  // Handle activation/deactivation logic
  if (validated.ativo !== undefined && validated.ativo !== entity.ativo) {
    if (validated.ativo) {
      // Activating - deactivate others first
      await deactivateOtherVersionsForSprint(session, entity.sprint, entity.id);
      activateNotaVersaoEntity(entity);
    } else {
      // Deactivating
      entity.ativo = false;
      entity.data_inativacao = new Date();
    }
  }

  // Commit flushes the UPDATE automatically
  await session.commit();

  return toResponse(entity);
}

export async function deleteNotaVersao(
  session: OrmSession,
  id: number,
): Promise<void> {
  const entity = await findNotaVersaoById(session, id);
  if (!entity) {
    throw new NotFoundError(`NotaVersao ${id} not found`);
  }

  // Soft delete the entity (mutates the tracked entity)
  softDeleteNotaVersaoEntity(entity);

  // Commit flushes the UPDATE automatically
  await session.commit();
}
