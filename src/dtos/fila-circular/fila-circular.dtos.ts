import {
  createMetalCrudDtoClasses,
  createPagedFilterQueryDtoClass,
  createPagedResponseDtoClass,
  t
} from "adorn-api";
import { FilaCircular } from "../../entities/FilaCircular";
import {
  createCrudErrors,
  createOptionsArraySchema,
  createOptionDto
} from "../common";
import type { CreateDto, UpdateDto } from "../common";

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

type FilaCircularMutationDto = CreateDto<FilaCircularDto>;
export type CreateFilaCircularDto = FilaCircularMutationDto;
export type ReplaceFilaCircularDto = FilaCircularMutationDto;
export type UpdateFilaCircularDto = UpdateDto<FilaCircularDto>;
export type FilaCircularParamsDto = InstanceType<typeof FilaCircularParamsDto>;

export const FilaCircularQueryDtoClass = createPagedFilterQueryDtoClass({
  name: "FilaCircularQueryDto",
  filters: {}
});

export interface FilaCircularQueryDto {
  page?: number;
  pageSize?: number;
}

export const FilaCircularPagedResponseDto = createPagedResponseDtoClass({
  name: "FilaCircularPagedResponseDto",
  itemDto: FilaCircularDto,
  description: "Paged fila circular list response."
});

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
