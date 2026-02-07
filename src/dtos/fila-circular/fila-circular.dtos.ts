import {
  createMetalCrudDtoClasses,
  t
} from "adorn-api";
import { FilaCircular } from "../../entities/FilaCircular";
import {
  createCrudErrors,
  createOptionsArraySchema,
  createOptionDto,
  createCrudQueryDtoPair,
  createCrudPagedResponseDto,
  buildFilters,
  type SortingQueryParams,
  type CreateDto,
  type UpdateDto
} from "../common";

const filaCircularCrud = createMetalCrudDtoClasses(FilaCircular, {
  response: { description: "Fila Circular retornada pela API." },
  mutationExclude: ["id"]
});

export const {
  response: FilaCircularDto,
  create: CreateFilaCircularDto,
  replace: ReplaceFilaCircularDto,
  update: UpdateFilaCircularDto,
  params: FilaCircularParamsDto
} = filaCircularCrud;

export type FilaCircularDto = FilaCircular;
export type CreateFilaCircularDto = CreateDto<FilaCircularDto>;
export type ReplaceFilaCircularDto = CreateDto<FilaCircularDto>;
export type UpdateFilaCircularDto = UpdateDto<FilaCircularDto>;
export type FilaCircularParamsDto = InstanceType<typeof FilaCircularParamsDto>;

// ============ Query DTOs (DRY) ============
const filaCircularFilters = buildFilters({}); // No filters defined

const { paged: FilaCircularQueryDtoClass, options: FilaCircularOptionsQueryDtoClass } = 
  createCrudQueryDtoPair({
    name: "FilaCircular",
    sortableColumns: ["id", "ultimo_elemento"],
    filters: filaCircularFilters
  });

export { FilaCircularQueryDtoClass, FilaCircularOptionsQueryDtoClass };

export interface FilaCircularQueryDto extends SortingQueryParams {
  page?: number;
  pageSize?: number;
}

export interface FilaCircularOptionsQueryDto extends SortingQueryParams {}

// ============ Response DTOs ============
export const FilaCircularPagedResponseDto = createCrudPagedResponseDto(
  "FilaCircular",
  FilaCircularDto,
  "fila circular"
);

export const FilaCircularErrors = createCrudErrors("fila circular");

const FilaCircularOptionDtoClass = createOptionDto(
  "FilaCircularOptionDto",
  "Fila Circular com id e nome."
);
export { FilaCircularOptionDtoClass as FilaCircularOptionDto };
export type FilaCircularOptionDto = InstanceType<typeof FilaCircularOptionDtoClass>;

export const FilaCircularOptionsDto = createOptionsArraySchema(
  FilaCircularOptionDtoClass,
  "Lista de filas circulares com id e nome."
);
