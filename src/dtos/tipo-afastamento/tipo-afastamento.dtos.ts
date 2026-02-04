import {
  createMetalCrudDtoClasses,
  createPagedResponseDtoClass,
  t
} from "adorn-api";
import { TipoAfastamento } from "../../entities/TipoAfastamento";
import {
  createCrudErrors,
  createOptionsArraySchema,
  createOptionDto,
  createPagedFilterSortingQueryDtoClass,
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

type TipoAfastamentoMutationDto = CreateDto<TipoAfastamentoDto>;
export type CreateTipoAfastamentoDto = TipoAfastamentoMutationDto;
export type ReplaceTipoAfastamentoDto = TipoAfastamentoMutationDto;
export type UpdateTipoAfastamentoDto = UpdateDto<TipoAfastamentoDto>;
export type TipoAfastamentoParamsDto = InstanceType<typeof TipoAfastamentoParamsDto>;

export const TipoAfastamentoQueryDtoClass = createPagedFilterSortingQueryDtoClass({
  name: "TipoAfastamentoQueryDto",
  sortableColumns: ["id", "nome"],
  filters: {
    nomeContains: { schema: t.string({ minLength: 1 }), operator: "contains" }
  }
});

export interface TipoAfastamentoQueryDto extends SortingQueryParams {
  page?: number;
  pageSize?: number;
  nomeContains?: string;
}

export const TipoAfastamentoPagedResponseDto = createPagedResponseDtoClass({
  name: "TipoAfastamentoPagedResponseDto",
  itemDto: TipoAfastamentoDto,
  description: "Paged tipo afastamento list response."
});

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
