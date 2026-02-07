import {
  Dto,
  Field,
  MergeDto,
  createMetalCrudDtoClasses,
  createPagedResponseDtoClass,
  t
} from "adorn-api";
import { Acervo } from "../../entities/Acervo";
import {
  createCrudErrors,
  createOptionsArraySchema,
  createOptionDto,
  EspecializadaResumoDto,
  TipoAcervoResumoDto,
  TipoMigracaoAcervoResumoDto,
  EquipeResponsavelResumoDto,
  EquipeApoioResumoDto,
  TipoDivisaoCargaTrabalhoResumoDto,
  ProcuradorTitularResumoDto,
  ClassificacaoResumoDto,
  TemaResumoDto,
  type CreateDto,
  type UpdateDto,
  createPagedFilterSortingQueryDtoClass,
  createFilterOnlySortingQueryDtoClass,
  type SortingQueryParams
} from "../common";

// ============ CRUD DTOs ============
const acervoCrud = createMetalCrudDtoClasses(Acervo, {
  response: { description: "Acervo retornado pela API." },
  mutationExclude: ["id"]
});

export const {
  response: AcervoDto,
  create: BaseCreateAcervoDto,
  replace: BaseReplaceAcervoDto,
  update: BaseUpdateAcervoDto,
  params: AcervoParamsDto
} = acervoCrud;

export type AcervoDto = Acervo;
export type AcervoParamsDto = InstanceType<typeof AcervoParamsDto>;

// ============ N:N Input DTOs ============
@Dto({ description: "Raiz de CNPJ com pivot data para associar ao acervo." })
export class RaizCnpjInputDto {
  @Field(t.integer())
  id!: number;

  @Field(t.string({ minLength: 1, maxLength: 8 }))
  raiz!: string;
}

@Dto({ description: "Campos N:N do acervo." })
export class AcervoRelationsInputDto {
  @Field(t.optional(t.array(t.integer())))
  classificacoes?: number[];

  @Field(t.optional(t.array(t.integer())))
  temasRelacionados?: number[];

  @Field(t.optional(t.array(t.integer())))
  equipes?: number[];

  @Field(t.optional(t.array(t.integer())))
  destinatarios?: number[];

  @Field(t.optional(t.array(t.ref(RaizCnpjInputDto))))
  raizesCNPJs?: RaizCnpjInputDto[];
}

@MergeDto([BaseCreateAcervoDto, AcervoRelationsInputDto], {
  name: "CreateAcervoDto",
  description: "Dados para criar acervo."
})
class CreateAcervoDtoClass {}

@MergeDto([BaseReplaceAcervoDto, AcervoRelationsInputDto], {
  name: "ReplaceAcervoDto",
  description: "Dados para substituir acervo."
})
class ReplaceAcervoDtoClass {}

@MergeDto([BaseUpdateAcervoDto, AcervoRelationsInputDto], {
  name: "UpdateAcervoDto",
  description: "Dados para atualizar acervo."
})
class UpdateAcervoDtoClass {}

const CreateAcervoDto = CreateAcervoDtoClass;
const ReplaceAcervoDto = ReplaceAcervoDtoClass;
const UpdateAcervoDto = UpdateAcervoDtoClass;
export { CreateAcervoDto, ReplaceAcervoDto, UpdateAcervoDto };

type AcervoMutationDto = CreateDto<AcervoDto> & Partial<AcervoRelationsInputDto>;
export type CreateAcervoDto = AcervoMutationDto;
export type ReplaceAcervoDto = AcervoMutationDto;
export type UpdateAcervoDto = UpdateDto<AcervoDto> & Partial<AcervoRelationsInputDto>;

// ============ Specialized Resumo DTOs (unique to acervo) ============
@Dto({ description: "Resumo da matéria." })
export class MateriaResumoDto {
  @Field(t.string({ minLength: 1 }))
  nome!: string;
}

@Dto({ description: "Tema relacionado com informações da matéria." })
export class TemaComMateriaDto {
  @Field(t.integer())
  id!: number;

  @Field(t.string({ minLength: 1 }))
  nome!: string;

  @Field(t.optional(t.ref(MateriaResumoDto)))
  materia?: MateriaResumoDto;
}

@Dto({ description: "Thumbnail do usuário." })
export class UsuarioThumbnailResumoDto {
  @Field(t.integer())
  id!: number;

  @Field(t.optional(t.bytes()))
  thumbnail?: string;
}

@Dto({ description: "Resumo de destinatário do acervo." })
export class DestinatarioResumoDto {
  @Field(t.integer())
  id!: number;

  @Field(t.string({ minLength: 1 }))
  nome!: string;

  @Field(t.string({ minLength: 1 }))
  login!: string;

  @Field(t.string({ minLength: 1 }))
  cargo!: string;

  @Field(t.optional(t.ref(EspecializadaResumoDto)))
  especializada?: InstanceType<typeof EspecializadaResumoDto>;

  @Field(t.optional(t.boolean()))
  estado_inatividade?: boolean;

  @Field(t.optional(t.ref(UsuarioThumbnailResumoDto)))
  usuarioThumbnail?: UsuarioThumbnailResumoDto;
}

@Dto({ description: "Resumo de raiz de CNPJ vinculada ao acervo." })
export class RaizCnpjResumoDto {
  @Field(t.integer())
  id!: number;

  @Field(t.string({ minLength: 1 }))
  raiz!: string;

  @Field(t.string({ minLength: 1 }))
  nome!: string;
}

// ============ Relation DTOs ============
@Dto({ description: "Relacionamentos resumidos do acervo." })
export class AcervoRelationsDto {
  @Field(t.optional(t.ref(EspecializadaResumoDto)))
  especializada?: InstanceType<typeof EspecializadaResumoDto>;

  @Field(t.optional(t.ref(ProcuradorTitularResumoDto)))
  procuradorTitular?: InstanceType<typeof ProcuradorTitularResumoDto>;

  @Field(t.optional(t.ref(TipoAcervoResumoDto)))
  tipoAcervo?: InstanceType<typeof TipoAcervoResumoDto>;

  @Field(t.optional(t.ref(TipoMigracaoAcervoResumoDto)))
  tipoMigracaoAcervo?: InstanceType<typeof TipoMigracaoAcervoResumoDto>;

  @Field(t.optional(t.ref(EquipeResponsavelResumoDto)))
  equipeResponsavel?: InstanceType<typeof EquipeResponsavelResumoDto>;

  @Field(t.optional(t.ref(TipoDivisaoCargaTrabalhoResumoDto)))
  tipoDivisaoCargaTrabalho?: InstanceType<typeof TipoDivisaoCargaTrabalhoResumoDto>;
}

@MergeDto([AcervoDto, AcervoRelationsDto], {
  name: "AcervoWithRelationsDto",
  description: "Acervo com dados relacionados resumidos."
})
export class AcervoWithRelationsDto {}

@Dto({ description: "Relacionamentos resumidos do acervo para listagem." })
export class AcervoListRelationsDto {
  @Field(t.optional(t.ref(EspecializadaResumoDto)))
  especializada?: InstanceType<typeof EspecializadaResumoDto>;

  @Field(t.optional(t.ref(ProcuradorTitularResumoDto)))
  procuradorTitular?: InstanceType<typeof ProcuradorTitularResumoDto>;

  @Field(t.optional(t.ref(TipoAcervoResumoDto)))
  tipoAcervo?: InstanceType<typeof TipoAcervoResumoDto>;
}

@MergeDto([AcervoDto, AcervoListRelationsDto], {
  name: "AcervoListItemDto",
  description: "Acervo com dados relacionados para listagem."
})
export class AcervoListItemDto {}

@Dto({ description: "Detalhes completos do acervo." })
export class AcervoDetailDto {
  @Field(t.optional(t.ref(EspecializadaResumoDto)))
  especializada?: InstanceType<typeof EspecializadaResumoDto>;

  @Field(t.optional(t.ref(ProcuradorTitularResumoDto)))
  procuradorTitular?: InstanceType<typeof ProcuradorTitularResumoDto>;

  @Field(t.optional(t.ref(TipoAcervoResumoDto)))
  tipoAcervo?: InstanceType<typeof TipoAcervoResumoDto>;

  @Field(t.optional(t.ref(TipoMigracaoAcervoResumoDto)))
  tipoMigracaoAcervo?: InstanceType<typeof TipoMigracaoAcervoResumoDto>;

  @Field(t.optional(t.ref(EquipeResponsavelResumoDto)))
  equipeResponsavel?: InstanceType<typeof EquipeResponsavelResumoDto>;

  @Field(t.optional(t.ref(TipoDivisaoCargaTrabalhoResumoDto)))
  tipoDivisaoCargaTrabalho?: InstanceType<typeof TipoDivisaoCargaTrabalhoResumoDto>;

  @Field(t.optional(t.boolean()))
  rotina_sob_demanda?: boolean;

  @Field(t.optional(t.array(t.ref(EquipeApoioResumoDto))))
  equipes?: Array<InstanceType<typeof EquipeApoioResumoDto>>;

  @Field(t.array(t.ref(ClassificacaoResumoDto)))
  classificacoes!: Array<InstanceType<typeof ClassificacaoResumoDto>>;

  @Field(t.array(t.ref(TemaComMateriaDto)))
  temasRelacionados!: TemaComMateriaDto[];

  @Field(t.array(t.ref(DestinatarioResumoDto)))
  destinatarios!: DestinatarioResumoDto[];

  @Field(t.array(t.ref(RaizCnpjResumoDto)))
  raizesCNPJs!: RaizCnpjResumoDto[];
}

// ============ Query/Response DTOs ============
export const AcervoQueryDtoClass = createPagedFilterSortingQueryDtoClass({
  name: "AcervoQueryDto",
  sortableColumns: ["id", "nome", "ativo", "created", "modified"],
  filters: {
    nomeContains: { schema: t.string({ minLength: 1 }), operator: "contains" },
    especializadaId: { schema: t.integer(), operator: "equals" },
    tipoAcervoId: { schema: t.integer(), operator: "equals" },
    procuradorTitularNomeContains: { schema: t.string({ minLength: 1 }), operator: "contains" },
    procuradorTitularId: { schema: t.integer(), operator: "equals" },
    ativo: { schema: t.integer(), operator: "equals" }
  }
});

export interface AcervoQueryDto extends SortingQueryParams {
  page?: number;
  pageSize?: number;
  nomeContains?: string;
  especializadaId?: number;
  tipoAcervoId?: number;
  procuradorTitularNomeContains?: string;
  procuradorTitularId?: number;
  ativo?: number;
}

export const AcervoOptionsQueryDtoClass = createFilterOnlySortingQueryDtoClass({
  name: "AcervoOptionsQueryDto",
  sortableColumns: ["id", "nome", "ativo", "created", "modified"],
  filters: {
    nomeContains: { schema: t.string({ minLength: 1 }), operator: "contains" },
    especializadaId: { schema: t.integer(), operator: "equals" },
    tipoAcervoId: { schema: t.integer(), operator: "equals" },
    procuradorTitularNomeContains: { schema: t.string({ minLength: 1 }), operator: "contains" },
    procuradorTitularId: { schema: t.integer(), operator: "equals" },
    ativo: { schema: t.integer(), operator: "equals" }
  }
});

export interface AcervoOptionsQueryDto extends SortingQueryParams {
  nomeContains?: string;
  especializadaId?: number;
  tipoAcervoId?: number;
  procuradorTitularNomeContains?: string;
  procuradorTitularId?: number;
  ativo?: number;
}

export const AcervoPagedResponseDto = createPagedResponseDtoClass({
  name: "AcervoPagedResponseDto",
  itemDto: AcervoListItemDto,
  description: "Paged acervo list response."
});

// ============ Errors & Options ============
export const AcervoErrors = createCrudErrors("acervo");

const AcervoOptionDtoClass = createOptionDto(
  "AcervoOptionDto",
  "Acervo com apenas id e nome."
);
export { AcervoOptionDtoClass as AcervoOptionDto };
export type AcervoOptionDto = InstanceType<typeof AcervoOptionDtoClass>;

export const AcervoOptionsDto = createOptionsArraySchema(
  AcervoOptionDtoClass,
  "Lista de acervos com id e nome."
);
