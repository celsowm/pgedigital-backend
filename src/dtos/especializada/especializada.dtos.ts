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

@Dto({ description: "Relacionamento com o responsavel da especializada." })
export class EspecializadaResponsavelDto {
  @Field(t.ref(ResponsavelResumoDto))
  responsavel!: ResponsavelResumoDto;
}

@MergeDto([EspecializadaDto, EspecializadaResponsavelDto], {
  name: "EspecializadaWithResponsavelDto",
  description: "Especializada com responsavel resumido."
})
export class EspecializadaWithResponsavelDto {}

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
