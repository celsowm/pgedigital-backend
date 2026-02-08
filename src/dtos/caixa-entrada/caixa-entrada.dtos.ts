import {
  Dto,
  Field,
  t
} from "adorn-api";
import {
  createCrudErrors,
  createCrudQueryDtoPair,
  createCrudPagedResponseDto,
  buildFilters,
  type SortingQueryParams
} from "../common";

// ============ Nested DTOs ============

@Dto({ description: "Tramitação resumida." })
export class TramitacaoResumoDto {
  @Field(t.integer())
  id!: number;

  @Field(t.string())
  nome!: string;

  @Field(t.string())
  codigo!: string;
}

@Dto({ description: "Remetente resumido." })
export class RemetenteResumoDto {
  @Field(t.integer())
  id!: number;

  @Field(t.string())
  nome!: string;
}

@Dto({ description: "Registro de tramitação resumido." })
export class RegistroTramitacaoResumoDto {
  @Field(t.integer())
  id!: number;

  @Field(t.optional(t.dateTime()))
  data_hora_tramitacao?: Date;

  @Field(t.optional(t.boolean()))
  substituicao?: boolean;

  @Field(t.optional(t.ref(TramitacaoResumoDto)))
  tramitacao?: TramitacaoResumoDto;

  @Field(t.optional(t.ref(RemetenteResumoDto)))
  remetente?: RemetenteResumoDto;
}

@Dto({ description: "Classificação resumida." })
export class ClassificacaoResumoDto {
  @Field(t.integer())
  id!: number;

  @Field(t.string())
  nome!: string;
}

@Dto({ description: "Especializada resumida." })
export class EspecializadaResumoDto {
  @Field(t.integer())
  id!: number;

  @Field(t.string())
  nome!: string;

  @Field(t.optional(t.string()))
  sigla?: string;
}

@Dto({ description: "Acervo resumido." })
export class AcervoResumoDto {
  @Field(t.integer())
  id!: number;

  @Field(t.string())
  nome!: string;
}

@Dto({ description: "Pessoa resumida para parte." })
export class PessoaResumoDto {
  @Field(t.integer())
  id!: number;

  @Field(t.string())
  nome!: string;
}

@Dto({ description: "Parte resumida com tipo polo e pessoa." })
export class ParteResumoDto {
  @Field(t.integer())
  id!: number;

  @Field(t.optional(t.string()))
  tipo_polo_id?: string;

  @Field(t.optional(t.ref(PessoaResumoDto)))
  pessoa?: PessoaResumoDto;
}

@Dto({ description: "Processo judicial resumido." })
export class ProcessoJudicialResumoDto {
  @Field(t.integer())
  id!: number;

  @Field(t.string())
  numero!: string;

  @Field(t.optional(t.array(t.ref(ParteResumoDto))))
  partes?: ParteResumoDto[];
}

@Dto({ description: "Estado resumido." })
export class EstadoResumoDto {
  @Field(t.integer())
  id!: number;

  @Field(t.string())
  nome!: string;
}

@Dto({ description: "Providência jurídica resumida." })
export class ProvidenciaJuridicaResumoDto {
  @Field(t.integer())
  id!: number;

  @Field(t.optional(t.dateTime()))
  prazo?: Date;

  @Field(t.optional(t.integer()))
  comunicacao_id?: number;

  @Field(t.optional(t.integer()))
  estado_id?: number;

  @Field(t.optional(t.ref(EstadoResumoDto)))
  estado?: EstadoResumoDto;
}

@Dto({ description: "Processo administrativo resumido para caixa de entrada." })
export class ProcessoAdministrativoResumoDto {
  @Field(t.integer())
  id!: number;

  @Field(t.optional(t.string()))
  codigo_pa?: string;

  @Field(t.optional(t.integer()))
  especializada_id?: number;

  @Field(t.optional(t.integer()))
  acervo_id?: number;

  @Field(t.optional(t.integer()))
  classificacao_id?: number;

  @Field(t.optional(t.integer()))
  processo_judicial_id?: number;

  @Field(t.optional(t.number()))
  valor_causa?: number;

  @Field(t.optional(t.ref(ClassificacaoResumoDto)))
  classificacao?: ClassificacaoResumoDto;

  @Field(t.optional(t.ref(EspecializadaResumoDto)))
  especializada?: EspecializadaResumoDto;

  @Field(t.optional(t.ref(AcervoResumoDto)))
  acervo?: AcervoResumoDto;

  @Field(t.optional(t.ref(ProcessoJudicialResumoDto)))
  processoJudicial?: ProcessoJudicialResumoDto;

  @Field(t.optional(t.array(t.ref(ProvidenciaJuridicaResumoDto))))
  providenciasJuridicas?: ProvidenciaJuridicaResumoDto[];
}

// ============ Main DTO ============

@Dto({ description: "Caixa de entrada (Carga)." })
export class CaixaEntradaDto {
  @Field(t.integer())
  id!: number;

  @Field(t.integer())
  registro_tramitacao_id!: number;

  @Field(t.integer())
  usuario_id!: number;

  @Field(t.optional(t.integer()))
  processo_administrativo_id?: number;

  @Field(t.optional(t.boolean()))
  lido?: boolean;

  @Field(t.optional(t.integer()))
  pasta_id?: number;

  @Field(t.optional(t.ref(RegistroTramitacaoResumoDto)))
  registroTramitacao?: RegistroTramitacaoResumoDto;

  @Field(t.optional(t.ref(ProcessoAdministrativoResumoDto)))
  processoAdministrativo?: ProcessoAdministrativoResumoDto;
}

// ============ Query DTOs ============

const caixaEntradaFilters = buildFilters({
  usuarioId: { schema: t.integer(), operator: "equals" },
  lido: { schema: t.boolean(), operator: "equals" },
  pastaId: { schema: t.integer(), operator: "equals" },
  tipoProcessoAdministrativoId: { schema: t.integer(), operator: "equals" },
  tipoEntrada: { schema: t.string({ minLength: 1 }), operator: "equals" },
  classificacaoId: { schema: t.integer(), operator: "equals" },
  temaPrincipalId: { schema: t.integer(), operator: "equals" },
  substituicao: { schema: t.string({ minLength: 1 }), operator: "equals" },
  acervoId: { schema: t.integer(), operator: "equals" },
  especializadaId: { schema: t.integer(), operator: "equals" },
  urgenciaId: { schema: t.integer(), operator: "equals" },
  numeroJudicialContains: { schema: t.string({ minLength: 1 }), operator: "contains" },
  numeroPaContains: { schema: t.string({ minLength: 1 }), operator: "contains" },
  autorContains: { schema: t.string({ minLength: 1 }), operator: "contains" },
  reuContains: { schema: t.string({ minLength: 1 }), operator: "contains" },
  interessadoContains: { schema: t.string({ minLength: 1 }), operator: "contains" },
  dataInicioGte: { schema: t.string({ minLength: 1 }), operator: "gte" },
  dataFimLte: { schema: t.string({ minLength: 1 }), operator: "lte" },
  origemDemanda: { schema: t.integer(), operator: "equals" },
  comPrazo: { schema: t.boolean(), operator: "equals" },
  comPrazoDefinido: { schema: t.boolean(), operator: "equals" }
});

const { paged: CaixaEntradaQueryDtoClass } = createCrudQueryDtoPair({
  name: "CaixaEntrada",
  sortableColumns: ["id", "lido", "registro_tramitacao.data_hora_tramitacao"],
  filters: caixaEntradaFilters
});

export { CaixaEntradaQueryDtoClass };

export interface CaixaEntradaQueryDto extends SortingQueryParams {
  page?: number;
  pageSize?: number;
  usuarioId: number;
  lido?: boolean;
  pastaId?: number;
  tipoProcessoAdministrativoId?: number;
  tipoEntrada?: string;
  classificacaoId?: number;
  temaPrincipalId?: number;
  substituicao?: string;
  acervoId?: number;
  especializadaId?: number;
  urgenciaId?: number;
  numeroJudicialContains?: string;
  numeroPaContains?: string;
  autorContains?: string;
  reuContains?: string;
  interessadoContains?: string;
  dataInicioGte?: string;
  dataFimLte?: string;
  origemDemanda?: number;
  comPrazo?: boolean;
  comPrazoDefinido?: boolean;
}

// ============ Response DTOs ============

export const CaixaEntradaPagedResponseDto = createCrudPagedResponseDto(
  "CaixaEntrada",
  CaixaEntradaDto,
  "caixaEntrada"
);

export const CaixaEntradaErrors = createCrudErrors("caixa-entrada");