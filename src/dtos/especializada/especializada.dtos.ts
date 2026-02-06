import {
  Dto,
  Field,
  MergeDto,
  createMetalCrudDtoClasses,
  createPagedResponseDtoClass,
  t
} from "adorn-api";
import { Especializada } from "../../entities/Especializada";
import {
  createCrudErrors,
  createOptionsArraySchema,
  createOptionDto,
  ResponsavelResumoDto,
  type CreateDto,
  type UpdateDto,
  createPagedFilterSortingQueryDtoClass,
  createFilterOnlySortingQueryDtoClass,
  type SortingQueryParams
} from "../common";

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
type EspecializadaMutationDto = CreateDto<EspecializadaDto>;
export type CreateEspecializadaDto = EspecializadaMutationDto;
export type ReplaceEspecializadaDto = EspecializadaMutationDto;
export type UpdateEspecializadaDto = UpdateDto<EspecializadaDto>;
export type EspecializadaParamsDto = InstanceType<typeof EspecializadaParamsDto>;

@Dto({ description: "Relacionamento com o responsavel da especializada." })
export class EspecializadaResponsavelDto {
  @Field(t.optional(t.ref(ResponsavelResumoDto)))
  responsavel?: InstanceType<typeof ResponsavelResumoDto>;
}

@MergeDto([EspecializadaDto, EspecializadaResponsavelDto], {
  name: "EspecializadaWithResponsavelDto",
  description: "Especializada com responsavel resumido."
})
export class EspecializadaWithResponsavelDto {}

export const EspecializadaQueryDtoClass = createPagedFilterSortingQueryDtoClass({
  name: "EspecializadaQueryDto",
  sortableColumns: ["id", "nome", "sigla", "codigo_ad"],
  filters: {
    nomeContains: { schema: t.string({ minLength: 1 }), operator: "contains" },
    siglaContains: { schema: t.string({ minLength: 1 }), operator: "contains" },
    responsavelNomeContains: {
      schema: t.string({ minLength: 1 }),
      operator: "contains"
    }
  }
});

export interface EspecializadaQueryDto extends SortingQueryParams {
  page?: number;
  pageSize?: number;
  nomeContains?: string;
  siglaContains?: string;
  responsavelNomeContains?: string;
}

export const EspecializadaOptionsQueryDtoClass = createFilterOnlySortingQueryDtoClass({
  name: "EspecializadaOptionsQueryDto",
  sortableColumns: ["id", "nome", "sigla", "codigo_ad"],
  filters: {
    nomeContains: { schema: t.string({ minLength: 1 }), operator: "contains" },
    siglaContains: { schema: t.string({ minLength: 1 }), operator: "contains" },
    responsavelNomeContains: {
      schema: t.string({ minLength: 1 }),
      operator: "contains"
    }
  }
});

export interface EspecializadaOptionsQueryDto extends SortingQueryParams {
  nomeContains?: string;
  siglaContains?: string;
  responsavelNomeContains?: string;
}

export const EspecializadaPagedResponseDto = createPagedResponseDtoClass({
  name: "EspecializadaPagedResponseDto",
  itemDto: EspecializadaWithResponsavelDto,
  description: "Paged especializada list response."
});

export const EspecializadaErrors = createCrudErrors("especializada");

export const EspecializadaSiglasDto = t.array(t.string(), {
  description: "Lista de siglas de especializadas."
});

const EspecializadaOptionDtoClass = createOptionDto(
  "EspecializadaOptionDto",
  "Especializada com apenas id e nome."
);
export { EspecializadaOptionDtoClass as EspecializadaOptionDto };
export type EspecializadaOptionDto = InstanceType<typeof EspecializadaOptionDtoClass>;

export const EspecializadaOptionsDto = createOptionsArraySchema(
  EspecializadaOptionDtoClass,
  "Lista de especializadas com id e nome."
);
