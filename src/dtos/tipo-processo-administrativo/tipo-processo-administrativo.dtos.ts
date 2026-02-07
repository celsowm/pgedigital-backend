import { t } from "adorn-api";
import {
  createOptionDto,
  createOptionsArraySchema,
  createCrudQueryDtoPair,
  CommonFilters,
  buildFilters,
  type SortingQueryParams
} from "../common";

const TipoProcessoAdministrativoOptionDtoClass = createOptionDto(
  "TipoProcessoAdministrativoOptionDto",
  "Tipo de processo administrativo com id e nome."
);
export { TipoProcessoAdministrativoOptionDtoClass as TipoProcessoAdministrativoOptionDto };
export type TipoProcessoAdministrativoOptionDto = InstanceType<typeof TipoProcessoAdministrativoOptionDtoClass>;

// ============ Query DTOs (DRY) ============
const tipoPAFilters = buildFilters({
  nomeContains: CommonFilters.nomeContains
});

const { paged: TipoProcessoAdministrativoQueryDtoClass, options: TipoProcessoAdministrativoOptionsQueryDtoClass } = 
  createCrudQueryDtoPair({
    name: "TipoProcessoAdministrativo",
    sortableColumns: ["id", "nome"],
    filters: tipoPAFilters
  });

export { TipoProcessoAdministrativoQueryDtoClass, TipoProcessoAdministrativoOptionsQueryDtoClass };

export interface TipoProcessoAdministrativoQueryDto extends SortingQueryParams {
  page?: number;
  pageSize?: number;
  nomeContains?: string;
}

export interface TipoProcessoAdministrativoOptionsQueryDto extends SortingQueryParams {
  nomeContains?: string;
}

export const TipoProcessoAdministrativoOptionsDto = createOptionsArraySchema(
  TipoProcessoAdministrativoOptionDtoClass,
  "Lista de tipos de processo administrativo com id e nome."
);
