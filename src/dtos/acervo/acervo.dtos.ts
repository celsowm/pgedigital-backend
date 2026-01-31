import {
  Dto,
  Errors,
  Field,
  MergeDto,
  SimpleErrorDto,
  createMetalCrudDtoClasses,
  createPagedFilterQueryDtoClass,
  createPagedResponseDtoClass,
  t
} from "adorn-api";
import { Acervo } from "../../entities/Acervo";

const acervoCrud = createMetalCrudDtoClasses(Acervo, {
  response: { description: "Acervo retornado pela API." },
  mutationExclude: ["id"]
});

export const {
  response: AcervoDto,
  create: CreateAcervoDto,
  replace: ReplaceAcervoDto,
  update: UpdateAcervoDto,
  params: AcervoParamsDto
} = acervoCrud;

export type AcervoDto = Acervo;
type AcervoMutationDto = Omit<AcervoDto, "id">;
export type CreateAcervoDto = AcervoMutationDto;
export type ReplaceAcervoDto = AcervoMutationDto;
export type UpdateAcervoDto = Partial<AcervoMutationDto>;
export type AcervoParamsDto = InstanceType<typeof AcervoParamsDto>;

@Dto({ description: "Resumo da especializada do acervo." })
export class EspecializadaResumoDto {
  @Field(t.integer())
  id!: number;

  @Field(t.string({ minLength: 1 }))
  nome!: string;
}

@Dto({ description: "Resumo do tipo de acervo." })
export class TipoAcervoResumoDto {
  @Field(t.integer())
  id!: number;

  @Field(t.string({ minLength: 1 }))
  nome!: string;
}

@Dto({ description: "Resumo do tipo de migração de acervo." })
export class TipoMigracaoAcervoResumoDto {
  @Field(t.integer())
  id!: number;

  @Field(t.string({ minLength: 1 }))
  nome!: string;
}

@Dto({ description: "Resumo da equipe responsável." })
export class EquipeResponsavelResumoDto {
  @Field(t.integer())
  id!: number;

  @Field(t.string({ minLength: 1 }))
  nome!: string;
}

@Dto({ description: "Resumo da equipe de apoio." })
export class EquipeApoioResumoDto {
  @Field(t.integer())
  id!: number;

  @Field(t.string({ minLength: 1 }))
  nome!: string;

  @Field(t.optional(t.ref(EspecializadaResumoDto)))
  especializada?: EspecializadaResumoDto;
}

@Dto({ description: "Resumo do tipo de divisão de carga de trabalho." })
export class TipoDivisaoCargaTrabalhoResumoDto {
  @Field(t.integer())
  id!: number;

  @Field(t.string({ minLength: 1 }))
  nome!: string;
}

@Dto({ description: "Resumo do procurador titular." })
export class ProcuradorTitularResumoDto {
  @Field(t.integer())
  id!: number;

  @Field(t.string({ minLength: 1 }))
  nome!: string;
}

@Dto({ description: "Resumo de classificação de processos." })
export class ClassificacaoResumoDto {
  @Field(t.integer())
  id!: number;

  @Field(t.string({ minLength: 1 }))
  nome!: string;
}

@Dto({ description: "Resumo de tema relacionado." })
export class TemaResumoDto {
  @Field(t.integer())
  id!: number;

  @Field(t.string({ minLength: 1 }))
  nome!: string;
}

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
  especializada?: EspecializadaResumoDto;

  @Field(t.optional(t.boolean()))
  estado_inatividade?: boolean;
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

@Dto({ description: "Relacionamentos resumidos do acervo." })
export class AcervoRelationsDto {
  @Field(t.optional(t.ref(EspecializadaResumoDto)))
  especializada?: EspecializadaResumoDto;

  @Field(t.optional(t.ref(ProcuradorTitularResumoDto)))
  procuradorTitular?: ProcuradorTitularResumoDto;

  @Field(t.optional(t.ref(TipoAcervoResumoDto)))
  tipoAcervo?: TipoAcervoResumoDto;

  @Field(t.optional(t.ref(TipoMigracaoAcervoResumoDto)))
  tipoMigracaoAcervo?: TipoMigracaoAcervoResumoDto;

  @Field(t.optional(t.ref(EquipeResponsavelResumoDto)))
  equipeResponsavel?: EquipeResponsavelResumoDto;

  @Field(t.optional(t.ref(TipoDivisaoCargaTrabalhoResumoDto)))
  tipoDivisaoCargaTrabalho?: TipoDivisaoCargaTrabalhoResumoDto;
}

@MergeDto([AcervoDto, AcervoRelationsDto], {
  name: "AcervoWithRelationsDto",
  description: "Acervo com dados relacionados resumidos."
})
export class AcervoWithRelationsDto {}

@Dto({ description: "Relacionamentos resumidos do acervo para listagem." })
export class AcervoListRelationsDto {
  @Field(t.optional(t.ref(EspecializadaResumoDto)))
  especializada?: EspecializadaResumoDto;

  @Field(t.optional(t.ref(ProcuradorTitularResumoDto)))
  procuradorTitular?: ProcuradorTitularResumoDto;

  @Field(t.optional(t.ref(TipoAcervoResumoDto)))
  tipoAcervo?: TipoAcervoResumoDto;
}

@MergeDto([AcervoDto, AcervoListRelationsDto], {
  name: "AcervoListItemDto",
  description: "Acervo com dados relacionados para listagem."
})
export class AcervoListItemDto {}

@Dto({ description: "Detalhes completos do acervo." })
export class AcervoDetailDto {
  @Field(t.optional(t.ref(EspecializadaResumoDto)))
  especializada?: EspecializadaResumoDto;

  @Field(t.optional(t.ref(ProcuradorTitularResumoDto)))
  procuradorTitular?: ProcuradorTitularResumoDto;

  @Field(t.optional(t.ref(TipoAcervoResumoDto)))
  tipoAcervo?: TipoAcervoResumoDto;

  @Field(t.optional(t.ref(TipoMigracaoAcervoResumoDto)))
  tipoMigracaoAcervo?: TipoMigracaoAcervoResumoDto;

  @Field(t.optional(t.ref(EquipeResponsavelResumoDto)))
  equipeResponsavel?: EquipeResponsavelResumoDto;

  @Field(t.optional(t.ref(TipoDivisaoCargaTrabalhoResumoDto)))
  tipoDivisaoCargaTrabalho?: TipoDivisaoCargaTrabalhoResumoDto;

  @Field(t.optional(t.boolean()))
  rotina_sob_demanda?: boolean;

  @Field(t.optional(t.array(t.ref(EquipeApoioResumoDto))))
  equipes?: EquipeApoioResumoDto[];

  @Field(t.array(t.ref(ClassificacaoResumoDto)))
  classificacoes!: ClassificacaoResumoDto[];

  @Field(t.array(t.ref(TemaComMateriaDto)))
  temasRelacionados!: TemaComMateriaDto[];

  @Field(t.array(t.ref(DestinatarioResumoDto)))
  destinatarios!: DestinatarioResumoDto[];

  @Field(t.array(t.ref(RaizCnpjResumoDto)))
  raizesCNPJs!: RaizCnpjResumoDto[];
}

export const AcervoQueryDtoClass = createPagedFilterQueryDtoClass({
  name: "AcervoQueryDto",
  filters: {
    nomeContains: { schema: t.string({ minLength: 1 }), operator: "contains" },
    especializadaId: { schema: t.integer(), operator: "equals" },
    tipoAcervoId: { schema: t.integer(), operator: "equals" },
    ativo: { schema: t.integer(), operator: "equals" }
  }
});

export interface AcervoQueryDto {
  page?: number;
  pageSize?: number;
  nomeContains?: string;
  especializadaId?: number;
  tipoAcervoId?: number;
  ativo?: number;
}

export const AcervoPagedResponseDto = createPagedResponseDtoClass({
  name: "AcervoPagedResponseDto",
  itemDto: AcervoListItemDto,
  description: "Paged acervo list response."
});

export const AcervoErrors = Errors(SimpleErrorDto, [
  { status: 400, description: "Invalid acervo id." },
  { status: 404, description: "Acervo not found." }
]);

@Dto({ description: "Acervo com apenas id e nome." })
export class AcervoOptionDto {
  @Field(t.integer())
  id!: number;

  @Field(t.string({ minLength: 1 }))
  nome!: string;
}

export const AcervoOptionsDto = t.array(t.ref(AcervoOptionDto), {
  description: "Lista de acervos com id e nome."
});
