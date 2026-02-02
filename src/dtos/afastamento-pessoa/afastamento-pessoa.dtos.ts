import {
  Dto,
  Field,
  MergeDto,
  createMetalCrudDtoClasses,
  createPagedFilterQueryDtoClass,
  createPagedResponseDtoClass,
  t
} from "adorn-api";
import { AfastamentoPessoa } from "../../entities/AfastamentoPessoa";
import {
  TipoDivisaoCargaTrabalhoResumoDto,
  EspecializadaResumoDto,
  createCrudErrors,
  createOptionsArraySchema,
  createOptionDto,
  createIdNomeResumoDto
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

export type AfastamentoPessoaDto = AfastamentoPessoa;
export type AfastamentoPessoaParamsDto = InstanceType<typeof AfastamentoPessoaParamsDto>;

// ============ Substitutos ============
@Dto({ description: "Substituto do afastamento pessoa." })
export class AfastamentoPessoaSubstitutoInputDto {
  @Field(t.integer())
  id!: number;

  @Field(t.optional(t.boolean()))
  usa_equipe_acervo_substituto?: boolean;

  @Field(t.optional(t.any()))
  final_codigo_pa?: unknown;
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
  usuarios?: Array<InstanceType<typeof AfastamentoPessoaSubstitutoDto>>;
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
  usuarios?: Array<InstanceType<typeof AfastamentoPessoaSubstitutoDto>>;
}

@MergeDto([AfastamentoPessoaDto, AfastamentoPessoaDetailRelationsDto], {
  name: "AfastamentoPessoaDetailDto",
  description: "Detalhes completos do afastamento pessoa."
})
export class AfastamentoPessoaDetailDto {}

// ============ Query/Response DTOs ============
export const AfastamentoPessoaQueryDtoClass = createPagedFilterQueryDtoClass({
  name: "AfastamentoPessoaQueryDto",
  filters: {
    usuarioAfastadoId: { schema: t.integer(), operator: "equals" },
    tipoAfastamentoId: { schema: t.integer(), operator: "equals" },
    tipoDivisaoCargaTrabalhoId: { schema: t.integer(), operator: "equals" },
    especializadaId: { schema: t.integer(), operator: "equals" },
    cargoContains: { schema: t.string({ minLength: 1 }), operator: "contains" },
    substitutoId: { schema: t.integer(), operator: "equals" },
    statusAfastamento: { schema: t.string({ minLength: 1 }), operator: "equals" },
    dataInicio: { schema: t.string({ format: "date" }), operator: "equals" },
    dataFim: { schema: t.string({ format: "date" }), operator: "equals" }
  }
});

export interface AfastamentoPessoaQueryDto {
  page?: number;
  pageSize?: number;
  usuarioAfastadoId?: number;
  tipoAfastamentoId?: number;
  tipoDivisaoCargaTrabalhoId?: number;
  especializadaId?: number;
  cargoContains?: string;
  substitutoId?: number;
  statusAfastamento?: string;
  dataInicio?: string;
  dataFim?: string;
}

export const AfastamentoPessoaPagedResponseDto = createPagedResponseDtoClass({
  name: "AfastamentoPessoaPagedResponseDto",
  itemDto: AfastamentoPessoaListItemDto,
  description: "Paged afastamento pessoa list response."
});

// ============ Errors & Options ============
export const AfastamentoPessoaErrors = createCrudErrors("afastamento pessoa");

const AfastamentoPessoaOptionDtoClass = createOptionDto(
  "AfastamentoPessoaOptionDto",
  "Afastamento pessoa com apenas id e nome."
);
export { AfastamentoPessoaOptionDtoClass as AfastamentoPessoaOptionDto };
export type AfastamentoPessoaOptionDto = InstanceType<typeof AfastamentoPessoaOptionDtoClass>;

export const AfastamentoPessoaOptionsDto = createOptionsArraySchema(
  AfastamentoPessoaOptionDtoClass,
  "Lista de afastamentos pessoa com id e nome."
);
