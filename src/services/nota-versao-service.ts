import { type Jsonify, type OrmSession } from 'metal-orm';
import { NotaVersao } from '../entities/index.js';
import * as notaVersaoRepository from '../repositories/nota-versao-repository.js';
import {
  validateNotaVersaoCreateInput,
  validateNotaVersaoUpdateInput,
} from '../validators/nota-versao-validators.js';
import { BaseEntityService } from './base-entity-service.js';
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

type NotaVersaoCreateValidated = ReturnType<typeof validateNotaVersaoCreateInput>;
type NotaVersaoUpdateValidated = ReturnType<typeof validateNotaVersaoUpdateInput>;

class NotaVersaoService extends BaseEntityService<
  NotaVersao,
  NotaVersaoCreateInput,
  NotaVersaoUpdateInput,
  NotaVersaoListQuery,
  { sprint?: number; ativo?: boolean; includeInactive?: boolean; includeDeleted?: boolean },
  NotaVersaoCreateValidated,
  NotaVersaoUpdateValidated
> {
  constructor() {
    super({
      entityName: NotaVersao.name,
      repository: {
        listPaged: (session, filters, paging) =>
          notaVersaoRepository.listNotaVersaoEntitiesPaged(session, filters, paging),
        findById: (session, id) => notaVersaoRepository.findNotaVersaoById(session, id),
      },
      validators: {
        validateCreate: validateNotaVersaoCreateInput,
        validateUpdate: validateNotaVersaoUpdateInput,
      },
      entityClass: NotaVersao,
      softDeleteFn: notaVersaoRepository.softDeleteNotaVersaoEntity,
      updateFields: ['data', 'sprint', 'mensagem'],
    });
  }

  protected getBaseFilters(query?: NotaVersaoListQuery): { sprint?: number; ativo?: boolean; includeInactive?: boolean; includeDeleted?: boolean } {
    return {
      sprint: query?.sprint,
      ativo: query?.ativo,
      includeInactive: query?.includeInactive,
      includeDeleted: query?.includeDeleted,
    };
  }

  protected async beforeCreate(session: OrmSession, validated: NotaVersaoCreateValidated): Promise<void> {
    if (validated.ativo) {
      await notaVersaoRepository.deactivateOtherVersionsForSprint(session, validated.sprint);
    }
  }

  protected async beforeUpdate(session: OrmSession, entity: NotaVersao, validated: NotaVersaoUpdateValidated): Promise<void> {
    const targetSprint = validated.sprint ?? entity.sprint;
    const sprintChanged = validated.sprint !== undefined && validated.sprint !== entity.sprint;

    if (validated.ativo === true) {
      await notaVersaoRepository.deactivateOtherVersionsForSprint(session, targetSprint, entity.id);
      notaVersaoRepository.activateNotaVersaoEntity(entity);
    } else if (validated.ativo === false) {
      notaVersaoRepository.deactivateNotaVersaoEntity(entity);
    } else if (sprintChanged && entity.ativo) {
      await notaVersaoRepository.deactivateOtherVersionsForSprint(session, targetSprint, entity.id);
    }
  }
}

const notaVersaoService = new NotaVersaoService();

export async function listNotaVersao(
  session: OrmSession,
  query?: NotaVersaoListQuery,
): Promise<NotaVersaoListResponse> {
  return notaVersaoService.list(session, query);
}

export async function getNotaVersao(
  session: OrmSession,
  id: number,
): Promise<NotaVersaoResponse> {
  return notaVersaoService.get(session, id);
}

export async function createNotaVersao(
  session: OrmSession,
  input: NotaVersaoCreateInput,
): Promise<NotaVersaoResponse> {
  return notaVersaoService.create(session, input);
}

export async function updateNotaVersao(
  session: OrmSession,
  id: number,
  input: NotaVersaoUpdateInput,
): Promise<NotaVersaoResponse> {
  return notaVersaoService.update(session, id, input);
}

export async function deleteNotaVersao(
  session: OrmSession,
  id: number,
): Promise<void> {
  return notaVersaoService.delete(session, id);
}
