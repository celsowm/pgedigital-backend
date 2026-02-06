import { t } from "adorn-api";
import {
  createOptionDto,
  createOptionsArraySchema,
  createFilterOnlySortingQueryDtoClass,
  createPagedFilterSortingQueryDtoClass,
  type SortingQueryParams
} from "../common";

const TipoProcessoAdministrativoOptionDtoClass = createOptionDto(
  "TipoProcessoAdministrativoOptionDto",
  "Tipo de processo administrativo com id e nome."
);
export { TipoProcessoAdministrativoOptionDtoClass as TipoProcessoAdministrativoOptionDto };
export type TipoProcessoAdministrativoOptionDto = InstanceType<typeof TipoProcessoAdministrativoOptionDtoClass>;

export const TipoProcessoAdministrativoQueryDtoClass = createPagedFilterSortingQueryDtoClass({
  name: "TipoProcessoAdministrativoQueryDto",
  filters: {
    nomeContains: { schema: t.string({ minLength: 1 }), operator: "contains" }
  }
});

export interface TipoProcessoAdministrativoQueryDto extends SortingQueryParams {
  page?: number;
  pageSize?: number;
  nomeContains?: string;
}

export const TipoProcessoAdministrativoOptionsQueryDtoClass = createFilterOnlySortingQueryDtoClass({
  name: "TipoProcessoAdministrativoOptionsQueryDto",
  filters: {
    nomeContains: { schema: t.string({ minLength: 1 }), operator: "contains" }
  }
});

export interface TipoProcessoAdministrativoOptionsQueryDto extends SortingQueryParams {
  nomeContains?: string;
}

export const TipoProcessoAdministrativoOptionsDto = createOptionsArraySchema(
  TipoProcessoAdministrativoOptionDtoClass,
  "Lista de tipos de processo administrativo com id e nome."
);
