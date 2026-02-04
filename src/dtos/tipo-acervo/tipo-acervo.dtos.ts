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
  createPagedFilterSortingQueryDtoClass,
  type SortingQueryParams
} from "../common";
import type { CreateDto, UpdateDto } from "../common";

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

type TipoAcervoMutationDto = CreateDto<TipoAcervoDto>;
export type CreateTipoAcervoDto = TipoAcervoMutationDto;
export type ReplaceTipoAcervoDto = TipoAcervoMutationDto;
export type UpdateTipoAcervoDto = UpdateDto<TipoAcervoDto>;
export type TipoAcervoParamsDto = InstanceType<typeof TipoAcervoParamsDto>;

export const TipoAcervoQueryDtoClass = createPagedFilterSortingQueryDtoClass({
  name: "TipoAcervoQueryDto",
  sortableColumns: ["id", "nome"],
  filters: {
    nomeContains: { schema: t.string({ minLength: 1 }), operator: "contains" }
  }
});

export interface TipoAcervoQueryDto extends SortingQueryParams {
  page?: number;
  pageSize?: number;
  nomeContains?: string;
}

export const TipoAcervoPagedResponseDto = createPagedResponseDtoClass({
  name: "TipoAcervoPagedResponseDto",
  itemDto: TipoAcervoDto,
  description: "Paged tipo acervo list response."
});

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

