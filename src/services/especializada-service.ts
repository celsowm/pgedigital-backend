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

export const especializadaService = new BaseEntityService<
  Especializada,
  EspecializadaCreateInput,
  EspecializadaUpdateInput,
  EspecializadaListQuery,
  especializadaRepository.EspecializadaListFilters,
  EspecializadaCreateValidated,
  EspecializadaUpdateValidated
>({
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
  getBaseFilters: (query) => ({
    nome: query?.nome,
    responsavel_id: query?.responsavel_id,
    tipo_especializada_id: query?.tipo_especializada_id,
    tipo_localidade_especializada_id: query?.tipo_localidade_especializada_id,
  }),
});

export type {
  EspecializadaCreateInput,
  EspecializadaListQuery,
  EspecializadaUpdateInput,
} from '../types/especializada-types.js';
