import {
  createMetalCrudDtoClasses,
  t
} from "adorn-api";
import { ExitoSucumbencia } from "../../entities/ExitoSucumbencia";
import {
  createCrudErrors,
  createOptionsArraySchema,
  createOptionDto,
  createCrudQueryDtoPair,
  createCrudPagedResponseDto,
  CommonFilters,
  buildFilters,
  type SortingQueryParams,
  type CreateDto,
  type UpdateDto
} from "../common";

const exitoSucumbenciaCrud = createMetalCrudDtoClasses(ExitoSucumbencia, {
  response: { description: "Êxito de Sucumbência retornada pela API." },
  mutationExclude: ["id"]
});

export const {
  response: ExitoSucumbenciaDto,
  create: CreateExitoSucumbenciaDto,
  replace: ReplaceExitoSucumbenciaDto,
  update: UpdateExitoSucumbenciaDto,
  params: ExitoSucumbenciaParamsDto
} = exitoSucumbenciaCrud;

export type ExitoSucumbenciaDto = ExitoSucumbencia;
export type CreateExitoSucumbenciaDto = CreateDto<ExitoSucumbenciaDto>;
export type ReplaceExitoSucumbenciaDto = CreateDto<ExitoSucumbenciaDto>;
export type UpdateExitoSucumbenciaDto = UpdateDto<ExitoSucumbenciaDto>;
export type ExitoSucumbenciaParamsDto = InstanceType<typeof ExitoSucumbenciaParamsDto>;

// ============ Query DTOs (DRY) ============
const exitoSucumbenciaFilters = buildFilters({
  nomeContains: CommonFilters.nomeContains
});

const { paged: ExitoSucumbenciaQueryDtoClass, options: ExitoSucumbenciaOptionsQueryDtoClass } = 
  createCrudQueryDtoPair({
    name: "ExitoSucumbencia",
    sortableColumns: ["id", "nome"],
    filters: exitoSucumbenciaFilters
  });

export { ExitoSucumbenciaQueryDtoClass, ExitoSucumbenciaOptionsQueryDtoClass };

export interface ExitoSucumbenciaQueryDto extends SortingQueryParams {
  page?: number;
  pageSize?: number;
  nomeContains?: string;
}

export interface ExitoSucumbenciaOptionsQueryDto extends SortingQueryParams {
  nomeContains?: string;
}

// ============ Response DTOs ============
export const ExitoSucumbenciaPagedResponseDto = createCrudPagedResponseDto(
  "ExitoSucumbencia",
  ExitoSucumbenciaDto,
  "êxito de sucumbência"
);

export const ExitoSucumbenciaErrors = createCrudErrors("êxito de sucumbência");

const ExitoSucumbenciaOptionDtoClass = createOptionDto(
  "ExitoSucumbenciaOptionDto",
  "Êxito de Sucumbência com id e nome."
);
export { ExitoSucumbenciaOptionDtoClass as ExitoSucumbenciaOptionDto };
export type ExitoSucumbenciaOptionDto = InstanceType<typeof ExitoSucumbenciaOptionDtoClass>;

export const ExitoSucumbenciaOptionsDto = createOptionsArraySchema(
  ExitoSucumbenciaOptionDtoClass,
  "Lista de êxito de sucumbência com id e nome."
);
