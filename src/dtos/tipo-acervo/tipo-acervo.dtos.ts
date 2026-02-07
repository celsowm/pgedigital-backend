import {
  createMetalCrudDtoClasses,
  createPagedResponseDtoClass,
  t
} from "adorn-api";
import { TipoAcervo } from "../../entities/TipoAcervo";
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

// ============ CRUD DTOs ============
const tipoAcervoCrud = createMetalCrudDtoClasses(TipoAcervo, {
  response: { description: "Tipo de acervo retornado pela API." },
  mutationExclude: ["id"]
});

export const {
  response: TipoAcervoDto,
  create: CreateTipoAcervoDto,
  replace: ReplaceTipoAcervoDto,
  update: UpdateTipoAcervoDto,
  params: TipoAcervoParamsDto
} = tipoAcervoCrud;

export type TipoAcervoDto = TipoAcervo;

// Type exports using the class types directly
export type CreateTipoAcervoDto = CreateDto<TipoAcervoDto>;
export type ReplaceTipoAcervoDto = CreateDto<TipoAcervoDto>;
export type UpdateTipoAcervoDto = UpdateDto<TipoAcervoDto>;
export type TipoAcervoParamsDto = InstanceType<typeof TipoAcervoParamsDto>;

// ============ Query DTOs (DRY: single filter config, generates both) ============
const tipoAcervoFilters = buildFilters({
  nomeContains: CommonFilters.nomeContains
});

const { paged: TipoAcervoQueryDtoClass, options: TipoAcervoOptionsQueryDtoClass } = 
  createCrudQueryDtoPair({
    name: "TipoAcervo",
    sortableColumns: ["id", "nome"],
    filters: tipoAcervoFilters
  });

export { TipoAcervoQueryDtoClass, TipoAcervoOptionsQueryDtoClass };

export interface TipoAcervoQueryDto extends SortingQueryParams {
  page?: number;
  pageSize?: number;
  nomeContains?: string;
}

export interface TipoAcervoOptionsQueryDto extends SortingQueryParams {
  nomeContains?: string;
}

// ============ Response DTOs ============
export const TipoAcervoPagedResponseDto = createCrudPagedResponseDto(
  "TipoAcervo",
  TipoAcervoDto,
  "tipo acervo"
);

// ============ Errors & Options ============
export const TipoAcervoErrors = createCrudErrors("tipo acervo");

const TipoAcervoOptionDtoClass = createOptionDto(
  "TipoAcervoOptionDto",
  "Tipo de acervo com id e nome."
);
export { TipoAcervoOptionDtoClass as TipoAcervoOptionDto };
export type TipoAcervoOptionDto = InstanceType<typeof TipoAcervoOptionDtoClass>;

export const TipoAcervoOptionsDto = createOptionsArraySchema(
  TipoAcervoOptionDtoClass,
  "Lista de tipos de acervo com id e nome."
);
