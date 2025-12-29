import type { OrmSession } from 'metal-orm';
import { eq, like, lower } from 'metal-orm';
import { Especializada } from '../entities/index.js';
import { createEntityRepository } from './entity-repository.js';
import type { LimitOffsetOptions } from './repository-utils.js';

export interface EspecializadaListFilters {
  nome?: string;
  responsavel_id?: number;
  tipo_especializada_id?: number;
  tipo_localidade_especializada_id?: number;
}

export interface EspecializadaListOptions extends EspecializadaListFilters, LimitOffsetOptions {}

const belongsToRelations = [
  'equipeTriagem',
  'responsavel',
  'tipoDivisaoCargaTrabalho',
  'tipoLocalidadeEspecializada',
  'tipoEspecializada',
] as const;

const selectColumns = [
  'id',
  'equipe_triagem_id',
  'responsavel_id',
  'nome',
  'usa_pge_digital',
  'codigo_ad',
  'usa_plantao_audiencia',
  'tipo_divisao_carga_trabalho_id',
  'tipo_localidade_especializada_id',
  'email',
  'restricao_ponto_focal',
  'sigla',
  'tipo_especializada_id',
  'especializada_triagem',
  'caixa_entrada_max',
] as const;

const repository = createEntityRepository<Especializada, EspecializadaListFilters>({
  entity: Especializada,
  select: selectColumns,
  include: belongsToRelations,
  orderBy: (ref) => [{ column: ref.nome, direction: 'ASC' }],
  applyFilters: (builder, ref, filters) => {
    let query = builder;

    if (filters.responsavel_id !== undefined) {
      query = query.where(eq(ref.responsavel_id, filters.responsavel_id));
    }

    if (filters.tipo_especializada_id !== undefined) {
      query = query.where(eq(ref.tipo_especializada_id, filters.tipo_especializada_id));
    }

    if (filters.tipo_localidade_especializada_id !== undefined) {
      query = query.where(
        eq(ref.tipo_localidade_especializada_id, filters.tipo_localidade_especializada_id),
      );
    }

    if (filters.nome) {
      const normalized = filters.nome.trim();
      if (normalized.length > 0) {
        query = query.where(like(lower(ref.nome), `%${normalized.toLowerCase()}%`));
      }
    }

    return query;
  },
});

export async function listEspecializadaEntities(
  session: OrmSession,
  options?: EspecializadaListOptions,
): Promise<Especializada[]> {
  return repository.list(session, options ?? ({} as EspecializadaListOptions));
}

export async function listEspecializadaEntitiesPaged(
  session: OrmSession,
  options?: EspecializadaListOptions,
  paging?: { page: number; pageSize: number },
) {
  return repository.listPaged(session, options ?? ({} as EspecializadaListFilters), paging);
}

export async function findEspecializadaById(
  session: OrmSession,
  id: number,
): Promise<Especializada | null> {
  return repository.findById(session, id);
}
