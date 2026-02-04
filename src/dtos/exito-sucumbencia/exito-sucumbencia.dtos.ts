import {
  createMetalCrudDtoClasses,
  createPagedResponseDtoClass,
  t
} from "adorn-api";
import { ExitoSucumbencia } from "../../entities/ExitoSucumbencia";
import {
  createCrudErrors,
  createOptionsArraySchema,
  createOptionDto,
  createPagedFilterSortingQueryDtoClass,
  type SortingQueryParams
} from "../common";
import type { CreateDto, UpdateDto } from "../common";

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

type ExitoSucumbenciaMutationDto = CreateDto<ExitoSucumbenciaDto>;
export type CreateExitoSucumbenciaDto = ExitoSucumbenciaMutationDto;
export type ReplaceExitoSucumbenciaDto = ExitoSucumbenciaMutationDto;
export type UpdateExitoSucumbenciaDto = UpdateDto<ExitoSucumbenciaDto>;
export type ExitoSucumbenciaParamsDto = InstanceType<typeof ExitoSucumbenciaParamsDto>;

export const ExitoSucumbenciaQueryDtoClass = createPagedFilterSortingQueryDtoClass({
  name: "ExitoSucumbenciaQueryDto",
  sortableColumns: ["id", "nome"],
  filters: {
    nomeContains: { schema: t.string({ minLength: 1 }), operator: "contains" }
  }
});

export interface ExitoSucumbenciaQueryDto extends SortingQueryParams {
  page?: number;
  pageSize?: number;
  nomeContains?: string;
}

export const ExitoSucumbenciaPagedResponseDto = createPagedResponseDtoClass({
  name: "ExitoSucumbenciaPagedResponseDto",
  itemDto: ExitoSucumbenciaDto,
  description: "Paged êxito de sucumbência list response."
});

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
