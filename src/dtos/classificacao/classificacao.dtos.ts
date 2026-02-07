import {
  createMetalCrudDtoClasses,
  t
} from "adorn-api";
import { Classificacao } from "../../entities/Classificacao";
import {
  createCrudErrors,
  createOptionsArraySchema,
  createOptionDto,
  createCrudQueryDtoPair,
  createCrudPagedResponseDto,
  CommonFilters,
  buildFilters,
  type SortingQueryParams
} from "../common";
import type { CreateDto, UpdateDto } from "../common";

const classificacaoCrud = createMetalCrudDtoClasses(Classificacao, {
  response: { description: "Classificação retornada pela API." },
  mutationExclude: ["id"]
});

export const {
  response: ClassificacaoDto,
  create: CreateClassificacaoDto,
  replace: ReplaceClassificacaoDto,
  update: UpdateClassificacaoDto,
  params: ClassificacaoParamsDto
} = classificacaoCrud;

export type ClassificacaoDto = Classificacao;

export type CreateClassificacaoDto = CreateDto<ClassificacaoDto>;
export type ReplaceClassificacaoDto = CreateDto<ClassificacaoDto>;
export type UpdateClassificacaoDto = UpdateDto<ClassificacaoDto>;
export type ClassificacaoParamsDto = InstanceType<typeof ClassificacaoParamsDto>;

// ============ Query DTOs (DRY) ============
const classificacaoFilters = buildFilters({
  nomeContains: CommonFilters.nomeContains
});

const { paged: ClassificacaoQueryDtoClass, options: ClassificacaoOptionsQueryDtoClass } = 
  createCrudQueryDtoPair({
    name: "Classificacao",
    sortableColumns: ["id", "nome", "peso"],
    filters: classificacaoFilters
  });

export { ClassificacaoQueryDtoClass, ClassificacaoOptionsQueryDtoClass };

export interface ClassificacaoQueryDto extends SortingQueryParams {
  page?: number;
  pageSize?: number;
  nomeContains?: string;
}

export interface ClassificacaoOptionsQueryDto extends SortingQueryParams {
  nomeContains?: string;
}

// ============ Response DTOs ============
export const ClassificacaoPagedResponseDto = createCrudPagedResponseDto(
  "Classificacao",
  ClassificacaoDto,
  "classificação"
);

export const ClassificacaoErrors = createCrudErrors("classificação");

const ClassificacaoOptionDtoClass = createOptionDto(
  "ClassificacaoOptionDto",
  "Classificação com id e nome."
);
export { ClassificacaoOptionDtoClass as ClassificacaoOptionDto };
export type ClassificacaoOptionDto = InstanceType<typeof ClassificacaoOptionDtoClass>;

export const ClassificacaoOptionsDto = createOptionsArraySchema(
  ClassificacaoOptionDtoClass,
  "Lista de classificações com id e nome."
);
