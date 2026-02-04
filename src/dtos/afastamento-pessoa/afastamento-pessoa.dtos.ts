import {
  Dto,
  Field,
  MergeDto,
  createMetalCrudDtoClasses,
  createPagedResponseDtoClass,
  t
} from "adorn-api";
import { AfastamentoPessoa } from "../../entities/AfastamentoPessoa";
import {
  TipoDivisaoCargaTrabalhoResumoDto,
  EspecializadaResumoDto,
  createCrudErrors,
  createIdNomeResumoDto,
  createPagedFilterSortingQueryDtoClass
} from "../common";

const afastamentoPessoaCrud = createMetalCrudDtoClasses(AfastamentoPessoa, {
  response: { description: "Afastamento pessoa retornado pela API." },
  mutationExclude: ["id"]
});

export const {
  response: AfastamentoPessoaDto,
  create: BaseCreateAfastamentoPessoaDto,
  replace: BaseReplaceAfastamentoPessoaDto,
  update: BaseUpdateAfastamentoPessoaDto,
  params: AfastamentoPessoaParamsDto
} = afastamentoPessoaCrud;

export type AfastamentoPessoaDto = InstanceType<typeof AfastamentoPessoaDto>;
export type AfastamentoPessoaEntity = AfastamentoPessoa;
export type AfastamentoPessoaParamsDto = InstanceType<typeof AfastamentoPessoaParamsDto>;

// ============ Substitutos ============
@Dto({ description: "Substituto do afastamento pessoa." })
export class AfastamentoPessoaSubstitutoInputDto {
  @Field(t.integer())
  id!: number;

  @Field(t.optional(t.boolean()))
  usa_equipe_acervo_substituto?: boolean;

  @Field(t.optional(t.union([t.string(), t.number(), t.null()])))
  final_codigo_pa?: string | number | null;
}

@Dto({ description: "Substitutos associados ao afastamento." })
export class AfastamentoPessoaSubstitutosInputDto {
  @Field(t.optional(t.array(t.ref(AfastamentoPessoaSubstitutoInputDto))))
  usuarios?: Array<InstanceType<typeof AfastamentoPessoaSubstitutoInputDto>>;
}

@MergeDto([BaseCreateAfastamentoPessoaDto, AfastamentoPessoaSubstitutosInputDto], {
  name: "CreateAfastamentoPessoaDto",
  description: "Dados para criar afastamento pessoa."
})
export class CreateAfastamentoPessoaDto {}

@MergeDto([BaseReplaceAfastamentoPessoaDto, AfastamentoPessoaSubstitutosInputDto], {
  name: "ReplaceAfastamentoPessoaDto",
  description: "Dados para substituir afastamento pessoa."
})
export class ReplaceAfastamentoPessoaDto {}

@MergeDto([BaseUpdateAfastamentoPessoaDto, AfastamentoPessoaSubstitutosInputDto], {
  name: "UpdateAfastamentoPessoaDto",
  description: "Dados para atualizar afastamento pessoa."
})
export class UpdateAfastamentoPessoaDto {}

// ============ Resumos ============
export const TipoAfastamentoResumoDto = createIdNomeResumoDto(
  "TipoAfastamentoResumoDto",
  "Resumo do tipo de afastamento."
);

@Dto({ description: "Thumbnail do usuário." })
export class UsuarioThumbnailResumoDto {
  @Field(t.integer())
  id!: number;

  @Field(t.optional(t.bytes()))
  thumbnail?: string;
}

@Dto({ description: "Resumo do usuario." })
export class UsuarioResumoDto {
  @Field(t.integer())
  id!: number;

  @Field(t.string({ minLength: 1 }))
  nome!: string;

  @Field(t.optional(t.string()))
  cargo?: string;

  @Field(t.optional(t.string()))
  vinculo?: string;

  @Field(t.optional(t.ref(EspecializadaResumoDto)))
  especializada?: InstanceType<typeof EspecializadaResumoDto>;

  @Field(t.optional(t.ref(UsuarioThumbnailResumoDto)))
  usuarioThumbnail?: UsuarioThumbnailResumoDto;
}

@Dto({ description: "Resumo da fila circular." })
export class FilaCircularResumoDto {
  @Field(t.integer())
  id!: number;

  @Field(t.integer())
  ultimo_elemento!: number;
}

@Dto({ description: "Substituto retornado no afastamento." })
export class AfastamentoPessoaSubstitutoDto {
  @Field(t.integer())
  id!: number;

  @Field(t.string({ minLength: 1 }))
  nome!: string;

  @Field(t.optional(t.string()))
  cargo?: string;

  @Field(t.optional(t.string()))
  vinculo?: string;

  @Field(t.optional(t.ref(EspecializadaResumoDto)))
  especializada?: InstanceType<typeof EspecializadaResumoDto>;

  @Field(t.optional(t.ref(UsuarioThumbnailResumoDto)))
  usuarioThumbnail?: UsuarioThumbnailResumoDto;

  @Field(t.optional(t.boolean()))
  usa_equipe_acervo_substituto?: boolean;

  @Field(t.optional(t.string()))
  final_codigo_pa?: string | null;
}

// ============ Relation DTOs ============
@Dto({ description: "Relacionamentos do afastamento pessoa (listagem)." })
export class AfastamentoPessoaListRelationsDto {
  @Field(t.optional(t.ref(UsuarioResumoDto)))
  usuario?: InstanceType<typeof UsuarioResumoDto>;

  @Field(t.optional(t.ref(TipoAfastamentoResumoDto)))
  tipoAfastamento?: InstanceType<typeof TipoAfastamentoResumoDto>;

  @Field(t.optional(t.ref(TipoDivisaoCargaTrabalhoResumoDto)))
  tipoDivisaoCargaTrabalho?: InstanceType<typeof TipoDivisaoCargaTrabalhoResumoDto>;

  @Field(t.optional(t.array(t.ref(AfastamentoPessoaSubstitutoDto))))
  substitutos?: Array<InstanceType<typeof AfastamentoPessoaSubstitutoDto>>;
}

@MergeDto([AfastamentoPessoaDto, AfastamentoPessoaListRelationsDto], {
  name: "AfastamentoPessoaListItemDto",
  description: "Afastamento pessoa com relacionamentos resumidos."
})
export class AfastamentoPessoaListItemDto {}

@Dto({ description: "Relacionamentos do afastamento pessoa (detalhe)." })
export class AfastamentoPessoaDetailRelationsDto {
  @Field(t.optional(t.ref(UsuarioResumoDto)))
  usuario?: InstanceType<typeof UsuarioResumoDto>;

  @Field(t.optional(t.ref(TipoAfastamentoResumoDto)))
  tipoAfastamento?: InstanceType<typeof TipoAfastamentoResumoDto>;

  @Field(t.optional(t.ref(TipoDivisaoCargaTrabalhoResumoDto)))
  tipoDivisaoCargaTrabalho?: InstanceType<typeof TipoDivisaoCargaTrabalhoResumoDto>;

  @Field(t.optional(t.ref(FilaCircularResumoDto)))
  filaCircular?: InstanceType<typeof FilaCircularResumoDto>;

  @Field(t.optional(t.array(t.ref(AfastamentoPessoaSubstitutoDto))))
  substitutos?: Array<InstanceType<typeof AfastamentoPessoaSubstitutoDto>>;
}

@MergeDto([AfastamentoPessoaDto, AfastamentoPessoaDetailRelationsDto], {
  name: "AfastamentoPessoaDetailDto",
  description: "Detalhes completos do afastamento pessoa."
})
export class AfastamentoPessoaDetailDto {}

// ============ Query/Response DTOs ============
export const AFASTAMENTO_PESSOA_FILTER_DEFS = {
  usuarioAfastadoId: { entityField: "usuario_id", schema: t.integer(), operator: "equals" },
  tipoAfastamentoId: { entityField: "tipo_afastamento_id", schema: t.integer(), operator: "equals" },
  tipoDivisaoCargaTrabalhoId: {
    entityField: "tipo_divisao_carga_trabalho_id",
    schema: t.integer(),
    operator: "equals"
  },
  especializadaId: { schema: t.integer(), operator: "equals" },
  cargoContains: { schema: t.string({ minLength: 1 }), operator: "contains" },
  substitutoId: { schema: t.integer(), operator: "equals" },
  statusAfastamento: { schema: t.string({ minLength: 1 }), operator: "equals" },
  dataInicio: { schema: t.string({ format: "date" }), operator: "equals" },
  dataFim: { schema: t.string({ format: "date" }), operator: "equals" }
} as const;

type AfastamentoPessoaFilterDef = typeof AFASTAMENTO_PESSOA_FILTER_DEFS;
type AfastamentoPessoaFilterKey = keyof AfastamentoPessoaFilterDef;
type EntityFieldFromDef<T> = T extends { entityField: infer F } ? F : never;
export type AfastamentoPessoaFilterFields = EntityFieldFromDef<AfastamentoPessoaFilterDef[AfastamentoPessoaFilterKey]>;
type FilterOperator = "equals" | "contains";

const buildQueryFilters = <T extends Record<string, { schema: unknown; operator: FilterOperator }>>(
  defs: T
): Record<string, { schema: unknown; operator: FilterOperator }> =>
  Object.fromEntries(
    Object.entries(defs).map(([key, def]) => [key, { schema: def.schema, operator: def.operator }])
  );

type FilterMappingDef = { entityField: AfastamentoPessoaFilterFields; operator: FilterOperator };
const hasEntityField = (def: unknown): def is FilterMappingDef =>
  typeof def === "object" && def !== null && "entityField" in def;

export const AFASTAMENTO_PESSOA_FILTER_MAPPINGS_SOURCE = Object.entries(AFASTAMENTO_PESSOA_FILTER_DEFS)
  .reduce<Record<string, { field: AfastamentoPessoaFilterFields; operator: FilterOperator }>>(
    (acc, [key, def]) => {
      if (hasEntityField(def)) {
        acc[key] = { field: def.entityField, operator: def.operator };
      }
      return acc;
    },
    {}
  );

const AFASTAMENTO_PESSOA_QUERY_FILTERS: Record<
  AfastamentoPessoaFilterKey,
  { schema: (typeof AFASTAMENTO_PESSOA_FILTER_DEFS)[AfastamentoPessoaFilterKey]["schema"]; operator: FilterOperator }
> = buildQueryFilters(AFASTAMENTO_PESSOA_FILTER_DEFS) as Record<
  AfastamentoPessoaFilterKey,
  { schema: (typeof AFASTAMENTO_PESSOA_FILTER_DEFS)[AfastamentoPessoaFilterKey]["schema"]; operator: FilterOperator }
>;

export const AfastamentoPessoaQueryDtoClass = createPagedFilterSortingQueryDtoClass({
  name: "AfastamentoPessoaQueryDto",
  sortableColumns: ["id", "data_inicio", "data_fim", "usuario_id", "tipo_afastamento_id"],
  filters: AFASTAMENTO_PESSOA_QUERY_FILTERS
});

export type AfastamentoPessoaQueryDto = InstanceType<typeof AfastamentoPessoaQueryDtoClass>;

export const AfastamentoPessoaPagedResponseDto = createPagedResponseDtoClass({
  name: "AfastamentoPessoaPagedResponseDto",
  itemDto: AfastamentoPessoaListItemDto,
  description: "Paged afastamento pessoa list response."
});

// ============ Errors & Options ============
export const AfastamentoPessoaErrors = createCrudErrors("afastamento pessoa");
