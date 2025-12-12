import { OrmSession } from 'metal-orm';
import { NotaVersao } from '../entities/index.js';
import {
  listNotaVersaoEntities,
  countNotaVersaoEntities,
  findNotaVersaoById,
  createNotaVersaoRecord,
  updateNotaVersaoEntity,
  deactivateNotaVersaoEntity,
  softDeleteNotaVersaoEntity,
  deactivateOtherVersionsForSprint,
  NotaVersaoCreatePayload,
} from '../repositories/nota-versao-repository.js';
import {
  normalizePage,
  normalizePageSize,
  validateNotaVersaoCreateInput,
  validateNotaVersaoUpdateInput,
} from '../validators/nota-versao-validators.js';
import { NotFoundError } from '../errors/http-error.js';
import type { PaginationMeta, PaginationQuery } from '../models/pagination.js';

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

const toResponse = (entity: NotaVersao): NotaVersaoResponse => ({
  id: entity.id,
  data: entity.data.toISOString(),
  sprint: entity.sprint,
  ativo: entity.ativo,
  mensagem: entity.mensagem,
  data_exclusao: entity.data_exclusao?.toISOString(),
  data_inativacao: entity.data_inativacao?.toISOString(),
});

const buildPaginationMeta = (
  page: number,
  pageSize: number,
  totalItems: number,
): PaginationMeta => ({
  page,
  pageSize,
  totalItems,
  totalPages: totalItems === 0 ? 0 : Math.ceil(totalItems / pageSize),
  hasNextPage: page * pageSize < totalItems,
  hasPreviousPage: page > 1,
});

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

  if (validated.ativo) {
    await deactivateOtherVersionsForSprint(session, validated.sprint);
  }

  const entity = createNotaVersaoRecord(session, {
    data: validated.data,
    sprint: validated.sprint,
    mensagem: validated.mensagem,
    ativo: validated.ativo,
  } satisfies NotaVersaoCreatePayload);
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
  const targetSprint = validated.sprint ?? entity.sprint;
  const intendedActive = validated.ativo ?? entity.ativo;

  // Handle activation logic - deactivate other versions for the sprint
  if (intendedActive && !entity.ativo) {
    await deactivateOtherVersionsForSprint(session, targetSprint, entity.id);
  }

  // Apply updates through repository
  updateNotaVersaoEntity(entity, {
    data: validated.data,
    sprint: validated.sprint,
    mensagem: validated.mensagem,
    ativo: intendedActive,
  });

  // Handle inactivation timestamp
  if (!intendedActive && !entity.data_inativacao) {
    deactivateNotaVersaoEntity(entity);
  }

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

  softDeleteNotaVersaoEntity(entity);
}
