import type { OrmSession } from 'metal-orm';
import { eq, entityRef, like, lower, selectFromEntity } from 'metal-orm';
import { Especializada } from '../entities/index.js';
import { findFirst, listEntities, listEntitiesPaged, type LimitOffsetOptions } from './repository-utils.js';

const E = entityRef(Especializada);

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
];

const buildFilteredQuery = (options?: EspecializadaListFilters) => {
  let builder = selectFromEntity(Especializada);

  if (options?.responsavel_id !== undefined) {
    builder = builder.where(eq(E.responsavel_id, options.responsavel_id));
  }

  if (options?.tipo_especializada_id !== undefined) {
    builder = builder.where(eq(E.tipo_especializada_id, options.tipo_especializada_id));
  }

  if (options?.tipo_localidade_especializada_id !== undefined) {
    builder = builder.where(
      eq(E.tipo_localidade_especializada_id, options.tipo_localidade_especializada_id),
    );
  }

  if (options?.nome) {
    const normalized = options.nome.trim();
    if (normalized.length > 0) {
      builder = builder.where(like(lower(E.nome), `%${normalized.toLowerCase()}%`));
    }
  }

  return builder;
};

const buildSelectedQuery = (options?: EspecializadaListOptions) => {
  let builder = buildFilteredQuery(options).select(...selectColumns);
  for (const relation of belongsToRelations) {
    builder = builder.include(relation);
  }
  return builder.orderBy(E.nome, 'ASC');
};

export async function listEspecializadaEntities(
  session: OrmSession,
  options?: EspecializadaListOptions,
): Promise<Especializada[]> {
  return listEntities(session, buildSelectedQuery, options);
}

export async function listEspecializadaEntitiesPaged(
  session: OrmSession,
  options?: EspecializadaListOptions,
  paging?: { page: number; pageSize: number },
) {
  return listEntitiesPaged<Especializada, EspecializadaListOptions>(
    session,
    buildSelectedQuery,
    options,
    paging,
  );
}

export async function findEspecializadaById(
  session: OrmSession,
  id: number,
): Promise<Especializada | null> {
  let builder = selectFromEntity(Especializada).select(...selectColumns);
  for (const relation of belongsToRelations) {
    builder = builder.include(relation);
  }

  return findFirst<Especializada>(session, builder.where(eq(E.id, id)));
}
