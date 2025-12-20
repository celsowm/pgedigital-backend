import type { OrmSession } from 'metal-orm';
import { Especializada } from '../entities/index.js';
import * as especializadaRepository from '../repositories/especializada-repository.js';
import {
  validateEspecializadaCreateInput,
  validateEspecializadaUpdateInput,
} from '../validators/especializada-validators.js';
import { BaseEntityService } from './base-entity-service.js';
import type { EntityResponse, PagedResponse } from './service-types.js';
import type {
  EspecializadaCreateInput,
  EspecializadaListQuery,
  EspecializadaUpdateInput,
} from '../types/especializada-types.js';

export type EspecializadaResponse = EntityResponse<Especializada>;
export type EspecializadaListResponse = PagedResponse<EspecializadaResponse>;

type EspecializadaCreateValidated = ReturnType<typeof validateEspecializadaCreateInput>;
type EspecializadaUpdateValidated = ReturnType<typeof validateEspecializadaUpdateInput>;

class EspecializadaService extends BaseEntityService<
  Especializada,
  EspecializadaCreateInput,
  EspecializadaUpdateInput,
  EspecializadaListQuery,
  especializadaRepository.EspecializadaListFilters,
  EspecializadaCreateValidated,
  EspecializadaUpdateValidated
> {
  constructor() {
    super({
      entityName: Especializada.name,
      repository: {
        listPaged: (session, filters, paging) =>
          especializadaRepository.listEspecializadaEntitiesPaged(session, filters, paging),
        findById: (session, id) => especializadaRepository.findEspecializadaById(session, id),
      },
      validators: {
        validateCreate: validateEspecializadaCreateInput,
        validateUpdate: validateEspecializadaUpdateInput,
      },
      entityClass: Especializada,
      updateFields: [
        'responsavel_id',
        'nome',
        'usa_pge_digital',
        'codigo_ad',
        'usa_plantao_audiencia',
        'equipe_triagem_id',
        'tipo_divisao_carga_trabalho_id',
        'tipo_localidade_especializada_id',
        'email',
        'restricao_ponto_focal',
        'sigla',
        'tipo_especializada_id',
        'especializada_triagem',
        'caixa_entrada_max',
      ],
    });
  }

  protected getBaseFilters(query?: EspecializadaListQuery): especializadaRepository.EspecializadaListFilters {
    return {
      nome: query?.nome,
      responsavel_id: query?.responsavel_id,
      tipo_especializada_id: query?.tipo_especializada_id,
      tipo_localidade_especializada_id: query?.tipo_localidade_especializada_id,
    };
  }
}

const especializadaService = new EspecializadaService();

export async function listEspecializada(
  session: OrmSession,
  query?: EspecializadaListQuery,
): Promise<EspecializadaListResponse> {
  return especializadaService.list(session, query);
}

export async function getEspecializada(
  session: OrmSession,
  id: number,
): Promise<EspecializadaResponse> {
  return especializadaService.get(session, id);
}

export async function createEspecializada(
  session: OrmSession,
  input: EspecializadaCreateInput,
): Promise<EspecializadaResponse> {
  return especializadaService.create(session, input);
}

export async function updateEspecializada(
  session: OrmSession,
  id: number,
  input: EspecializadaUpdateInput,
): Promise<EspecializadaResponse> {
  return especializadaService.update(session, id, input);
}

export async function deleteEspecializada(
  session: OrmSession,
  id: number,
): Promise<void> {
  return especializadaService.delete(session, id);
}

export type {
  EspecializadaCreateInput,
  EspecializadaListQuery,
  EspecializadaUpdateInput,
} from '../types/especializada-types.js';
