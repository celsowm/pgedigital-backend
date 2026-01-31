import {
  Dto,
  Errors,
  Field,
  SimpleErrorDto,
  createMetalCrudDtoClasses,
  createPagedFilterQueryDtoClass,
  createPagedResponseDtoClass,
  t
} from "adorn-api";
import { Especializada } from "../../entities/Especializada";

const especializadaCrud = createMetalCrudDtoClasses(Especializada, {
  response: { description: "Especializada retornada pela API." },
  mutationExclude: ["id"]
});

export const {
  response: EspecializadaDto,
  create: CreateEspecializadaDto,
  replace: ReplaceEspecializadaDto,
  update: UpdateEspecializadaDto,
  params: EspecializadaParamsDto
} = especializadaCrud;

export type EspecializadaDto = Especializada;
type EspecializadaMutationDto = Omit<EspecializadaDto, "id">;
export type CreateEspecializadaDto = EspecializadaMutationDto;
export type ReplaceEspecializadaDto = EspecializadaMutationDto;
export type UpdateEspecializadaDto = Partial<EspecializadaMutationDto>;
export type EspecializadaParamsDto = InstanceType<typeof EspecializadaParamsDto>;

@Dto({ description: "Resumo do responsavel da especializada." })
export class ResponsavelResumoDto {
  @Field(t.integer())
  id!: number;

  @Field(t.string({ minLength: 1 }))
  nome!: string;
}

/**
 * DTO explícito para Especializada com responsavel.
 * Usado como alternativa ao MergeDto que não estava funcionando corretamente.
 */
@Dto({ description: "Especializada com responsavel resumido." })
export class EspecializadaWithResponsavelDto {
  @Field(t.integer())
  id!: number;

  @Field(t.optional(t.integer()))
  equipe_triagem_id?: number;

  @Field(t.integer())
  responsavel_id!: number;

  @Field(t.string({ minLength: 1 }))
  nome!: string;

  @Field(t.boolean())
  usa_pge_digital!: boolean;

  @Field(t.integer())
  codigo_ad!: number;

  @Field(t.boolean())
  usa_plantao_audiencia!: boolean;

  @Field(t.optional(t.integer()))
  tipo_divisao_carga_trabalho_id?: number;

  @Field(t.optional(t.integer()))
  tipo_localidade_especializada_id?: number;

  @Field(t.optional(t.string()))
  email?: string;

  @Field(t.boolean())
  restricao_ponto_focal!: boolean;

  @Field(t.optional(t.string({ maxLength: 10 })))
  sigla?: string;

  @Field(t.optional(t.integer()))
  tipo_especializada_id?: number;

  @Field(t.boolean())
  especializada_triagem!: boolean;

  @Field(t.optional(t.integer()))
  caixa_entrada_max?: number;

  @Field(t.optional(t.ref(ResponsavelResumoDto)))
  responsavel?: ResponsavelResumoDto;
}

export const EspecializadaQueryDtoClass = createPagedFilterQueryDtoClass({
  name: "EspecializadaQueryDto",
  filters: {
    nomeContains: { schema: t.string({ minLength: 1 }), operator: "contains" },
    siglaContains: { schema: t.string({ minLength: 1 }), operator: "contains" },
    responsavelNomeContains: {
      schema: t.string({ minLength: 1 }),
      operator: "contains"
    }
  }
});

export interface EspecializadaQueryDto {
  page?: number;
  pageSize?: number;
  nomeContains?: string;
  siglaContains?: string;
  responsavelNomeContains?: string;
}

export const EspecializadaPagedResponseDto = createPagedResponseDtoClass({
  name: "EspecializadaPagedResponseDto",
  itemDto: EspecializadaWithResponsavelDto,
  description: "Paged especializada list response."
});

export const EspecializadaErrors = Errors(SimpleErrorDto, [
  { status: 400, description: "Invalid especializada id." },
  { status: 404, description: "Especializada not found." }
]);

export const EspecializadaSiglasDto = t.array(t.string(), {
  description: "Lista de siglas de especializadas."
});

@Dto({ description: "Especializada com apenas id e nome." })
export class EspecializadaOptionDto {
  @Field(t.integer())
  id!: number;

  @Field(t.string({ minLength: 1 }))
  nome!: string;
}

export const EspecializadaOptionsDto = t.array(t.ref(EspecializadaOptionDto), {
  description: "Lista de especializadas com id e nome."
});
