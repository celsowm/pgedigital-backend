import {
  createMetalCrudDtoClasses,
  createPagedResponseDtoClass,
  t
} from "adorn-api";
import { TipoDivisaoCargaTrabalho } from "../../entities/TipoDivisaoCargaTrabalho";
import {
  createCrudErrors,
  createOptionsArraySchema,
  createOptionDto,
  createFilterOnlySortingQueryDtoClass,
  createPagedFilterSortingQueryDtoClass,
  type SortingQueryParams
} from "../common";
import type { CreateDto, UpdateDto } from "../common";

const tipoDivisaoCargaTrabalhoCrud = createMetalCrudDtoClasses(TipoDivisaoCargaTrabalho, {
  response: { description: "Tipo de divisão de carga de trabalho retornado pela API." },
  mutationExclude: ["id"]
});

export const {
  response: TipoDivisaoCargaTrabalhoDto,
  create: CreateTipoDivisaoCargaTrabalhoDto,
  replace: ReplaceTipoDivisaoCargaTrabalhoDto,
  update: UpdateTipoDivisaoCargaTrabalhoDto,
  params: TipoDivisaoCargaTrabalhoParamsDto
} = tipoDivisaoCargaTrabalhoCrud;

export type TipoDivisaoCargaTrabalhoDto = TipoDivisaoCargaTrabalho;

type TipoDivisaoCargaTrabalhoMutationDto = CreateDto<TipoDivisaoCargaTrabalhoDto>;
export type CreateTipoDivisaoCargaTrabalhoDto = TipoDivisaoCargaTrabalhoMutationDto;
export type ReplaceTipoDivisaoCargaTrabalhoDto = TipoDivisaoCargaTrabalhoMutationDto;
export type UpdateTipoDivisaoCargaTrabalhoDto = UpdateDto<TipoDivisaoCargaTrabalhoDto>;
export type TipoDivisaoCargaTrabalhoParamsDto = InstanceType<typeof TipoDivisaoCargaTrabalhoParamsDto>;

export const TipoDivisaoCargaTrabalhoQueryDtoClass = createPagedFilterSortingQueryDtoClass({
  name: "TipoDivisaoCargaTrabalhoQueryDto",
  filters: {
    nomeContains: { schema: t.string({ minLength: 1 }), operator: "contains" }
  }
});

export interface TipoDivisaoCargaTrabalhoQueryDto extends SortingQueryParams {
  page?: number;
  pageSize?: number;
  nomeContains?: string;
}

export const TipoDivisaoCargaTrabalhoOptionsQueryDtoClass = createFilterOnlySortingQueryDtoClass({
  name: "TipoDivisaoCargaTrabalhoOptionsQueryDto",
  filters: {
    nomeContains: { schema: t.string({ minLength: 1 }), operator: "contains" }
  }
});

export interface TipoDivisaoCargaTrabalhoOptionsQueryDto extends SortingQueryParams {
  nomeContains?: string;
}

export const TipoDivisaoCargaTrabalhoPagedResponseDto = createPagedResponseDtoClass({
  name: "TipoDivisaoCargaTrabalhoPagedResponseDto",
  itemDto: TipoDivisaoCargaTrabalhoDto,
  description: "Paged tipo divisao carga trabalho list response."
});

export const TipoDivisaoCargaTrabalhoErrors = createCrudErrors("tipo divisao carga trabalho");

const TipoDivisaoCargaTrabalhoOptionDtoClass = createOptionDto(
  "TipoDivisaoCargaTrabalhoOptionDto",
  "Tipo de divisão de carga de trabalho com id e nome."
);
export { TipoDivisaoCargaTrabalhoOptionDtoClass as TipoDivisaoCargaTrabalhoOptionDto };
export type TipoDivisaoCargaTrabalhoOptionDto = InstanceType<typeof TipoDivisaoCargaTrabalhoOptionDtoClass>;

export const TipoDivisaoCargaTrabalhoOptionsDto = createOptionsArraySchema(
  TipoDivisaoCargaTrabalhoOptionDtoClass,
  "Lista de tipos de divisão de carga de trabalho com id e nome."
);
