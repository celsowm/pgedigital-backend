import {
  createMetalCrudDtoClasses,
  t
} from "adorn-api";
import { TipoAfastamento } from "../../entities/TipoAfastamento";
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

const tipoAfastamentoCrud = createMetalCrudDtoClasses(TipoAfastamento, {
  response: { description: "Tipo de afastamento retornado pela API." },
  mutationExclude: ["id"]
});

export const {
  response: TipoAfastamentoDto,
  create: CreateTipoAfastamentoDto,
  replace: ReplaceTipoAfastamentoDto,
  update: UpdateTipoAfastamentoDto,
  params: TipoAfastamentoParamsDto
} = tipoAfastamentoCrud;

export type TipoAfastamentoDto = TipoAfastamento;
export type CreateTipoAfastamentoDto = CreateDto<TipoAfastamentoDto>;
export type ReplaceTipoAfastamentoDto = CreateDto<TipoAfastamentoDto>;
export type UpdateTipoAfastamentoDto = UpdateDto<TipoAfastamentoDto>;
export type TipoAfastamentoParamsDto = InstanceType<typeof TipoAfastamentoParamsDto>;

// ============ Query DTOs (DRY) ============
const tipoAfastamentoFilters = buildFilters({
  nomeContains: CommonFilters.nomeContains
});

const { paged: TipoAfastamentoQueryDtoClass, options: TipoAfastamentoOptionsQueryDtoClass } = 
  createCrudQueryDtoPair({
    name: "TipoAfastamento",
    sortableColumns: ["id", "nome"],
    filters: tipoAfastamentoFilters
  });

export { TipoAfastamentoQueryDtoClass, TipoAfastamentoOptionsQueryDtoClass };

export interface TipoAfastamentoQueryDto extends SortingQueryParams {
  page?: number;
  pageSize?: number;
  nomeContains?: string;
}

export interface TipoAfastamentoOptionsQueryDto extends SortingQueryParams {
  nomeContains?: string;
}

// ============ Response DTOs ============
export const TipoAfastamentoPagedResponseDto = createCrudPagedResponseDto(
  "TipoAfastamento",
  TipoAfastamentoDto,
  "tipo afastamento"
);

export const TipoAfastamentoErrors = createCrudErrors("tipo afastamento");

const TipoAfastamentoOptionDtoClass = createOptionDto(
  "TipoAfastamentoOptionDto",
  "Tipo de afastamento com id e nome."
);
export { TipoAfastamentoOptionDtoClass as TipoAfastamentoOptionDto };
export type TipoAfastamentoOptionDto = InstanceType<typeof TipoAfastamentoOptionDtoClass>;

export const TipoAfastamentoOptionsDto = createOptionsArraySchema(
  TipoAfastamentoOptionDtoClass,
  "Lista de tipos de afastamento com id e nome."
);
