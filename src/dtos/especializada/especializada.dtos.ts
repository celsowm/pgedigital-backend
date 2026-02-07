import {
  Dto,
  Field,
  MergeDto,
  createMetalCrudDtoClasses,
  t
} from "adorn-api";
import { Especializada } from "../../entities/Especializada";
import {
  createCrudErrors,
  createOptionsArraySchema,
  createOptionDto,
  ResponsavelResumoDto,
  createCrudQueryDtoPair,
  createCrudPagedResponseDto,
  CommonFilters,
  buildFilters,
  type SortingQueryParams,
  type CreateDto,
  type UpdateDto
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
export type CreateEspecializadaDto = CreateDto<EspecializadaDto>;
export type ReplaceEspecializadaDto = CreateDto<EspecializadaDto>;
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

// ============ Query DTOs (DRY) ============
const especializadaFilters = buildFilters({
  nomeContains: CommonFilters.nomeContains,
  siglaContains: { schema: t.string({ minLength: 1 }), operator: "contains" },
  responsavelNomeContains: { schema: t.string({ minLength: 1 }), operator: "contains" }
});

const { paged: EspecializadaQueryDtoClass, options: EspecializadaOptionsQueryDtoClass } = 
  createCrudQueryDtoPair({
    name: "Especializada",
    sortableColumns: ["id", "nome", "sigla", "codigo_ad"],
    filters: especializadaFilters
  });

export { EspecializadaQueryDtoClass, EspecializadaOptionsQueryDtoClass };

export interface EspecializadaQueryDto extends SortingQueryParams {
  page?: number;
  pageSize?: number;
  nomeContains?: string;
  siglaContains?: string;
  responsavelNomeContains?: string;
}

export interface EspecializadaOptionsQueryDto extends SortingQueryParams {
  nomeContains?: string;
  siglaContains?: string;
  responsavelNomeContains?: string;
}

// ============ Response DTOs ============
export const EspecializadaPagedResponseDto = createCrudPagedResponseDto(
  "Especializada",
  EspecializadaWithResponsavelDto,
  "especializada"
);

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
