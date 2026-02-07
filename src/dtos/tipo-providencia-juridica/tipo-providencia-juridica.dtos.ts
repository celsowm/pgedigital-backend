import { t } from "adorn-api";
import {
  createOptionDto,
  createOptionsArraySchema,
  createCrudQueryDtoPair,
  CommonFilters,
  buildFilters,
  type SortingQueryParams
} from "../common";

const TipoProvidenciaJuridicaOptionDtoClass = createOptionDto(
  "TipoProvidenciaJuridicaOptionDto",
  "Tipo de providência jurídica com id e nome."
);
export { TipoProvidenciaJuridicaOptionDtoClass as TipoProvidenciaJuridicaOptionDto };
export type TipoProvidenciaJuridicaOptionDto = InstanceType<typeof TipoProvidenciaJuridicaOptionDtoClass>;

// ============ Query DTOs (DRY) ============
const tipoProvidenciaJuridicaFilters = buildFilters({
  nomeContains: CommonFilters.nomeContains
});

const { paged: TipoProvidenciaJuridicaQueryDtoClass, options: TipoProvidenciaJuridicaOptionsQueryDtoClass } = 
  createCrudQueryDtoPair({
    name: "TipoProvidenciaJuridica",
    sortableColumns: ["id", "nome"],
    filters: tipoProvidenciaJuridicaFilters
  });

export { TipoProvidenciaJuridicaQueryDtoClass, TipoProvidenciaJuridicaOptionsQueryDtoClass };

export interface TipoProvidenciaJuridicaQueryDto extends SortingQueryParams {
  page?: number;
  pageSize?: number;
  nomeContains?: string;
}

export interface TipoProvidenciaJuridicaOptionsQueryDto extends SortingQueryParams {
  nomeContains?: string;
}

export const TipoProvidenciaJuridicaOptionsDto = createOptionsArraySchema(
  TipoProvidenciaJuridicaOptionDtoClass,
  "Lista de tipos de providência jurídica com id e nome."
);
