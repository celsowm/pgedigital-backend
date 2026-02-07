import {
  createMetalCrudDtoClasses,
  t
} from "adorn-api";
import { TipoDivisaoCargaTrabalho } from "../../entities/TipoDivisaoCargaTrabalho";
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
export type CreateTipoDivisaoCargaTrabalhoDto = CreateDto<TipoDivisaoCargaTrabalhoDto>;
export type ReplaceTipoDivisaoCargaTrabalhoDto = CreateDto<TipoDivisaoCargaTrabalhoDto>;
export type UpdateTipoDivisaoCargaTrabalhoDto = UpdateDto<TipoDivisaoCargaTrabalhoDto>;
export type TipoDivisaoCargaTrabalhoParamsDto = InstanceType<typeof TipoDivisaoCargaTrabalhoParamsDto>;

// ============ Query DTOs (DRY) ============
const tipoDivisaoCargaTrabalhoFilters = buildFilters({
  nomeContains: CommonFilters.nomeContains
});

const { paged: TipoDivisaoCargaTrabalhoQueryDtoClass, options: TipoDivisaoCargaTrabalhoOptionsQueryDtoClass } = 
  createCrudQueryDtoPair({
    name: "TipoDivisaoCargaTrabalho",
    sortableColumns: ["id", "nome"],
    filters: tipoDivisaoCargaTrabalhoFilters
  });

export { TipoDivisaoCargaTrabalhoQueryDtoClass, TipoDivisaoCargaTrabalhoOptionsQueryDtoClass };

export interface TipoDivisaoCargaTrabalhoQueryDto extends SortingQueryParams {
  page?: number;
  pageSize?: number;
  nomeContains?: string;
}

export interface TipoDivisaoCargaTrabalhoOptionsQueryDto extends SortingQueryParams {
  nomeContains?: string;
}

// ============ Response DTOs ============
export const TipoDivisaoCargaTrabalhoPagedResponseDto = createCrudPagedResponseDto(
  "TipoDivisaoCargaTrabalho",
  TipoDivisaoCargaTrabalhoDto,
  "tipo divisao carga trabalho"
);

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
