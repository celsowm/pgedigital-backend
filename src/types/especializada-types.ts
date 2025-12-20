import type { Jsonify } from 'metal-orm';
import type { Especializada } from '../entities/index.js';
import type { CreateInput, ListQuery, UpdateInput } from '../services/service-types.js';

export type EspecializadaCreateInput = CreateInput<
  Jsonify<Especializada>,
  'responsavel_id' | 'nome' | 'usa_pge_digital' | 'codigo_ad' | 'usa_plantao_audiencia',
  | 'equipe_triagem_id'
  | 'tipo_divisao_carga_trabalho_id'
  | 'tipo_localidade_especializada_id'
  | 'email'
  | 'restricao_ponto_focal'
  | 'sigla'
  | 'tipo_especializada_id'
  | 'especializada_triagem'
  | 'caixa_entrada_max'
>;

export type EspecializadaUpdateInput = UpdateInput<EspecializadaCreateInput>;

export type EspecializadaListQuery = ListQuery<{
  nome?: string;
  responsavel_id?: number;
  tipo_especializada_id?: number;
  tipo_localidade_especializada_id?: number;
}>;
