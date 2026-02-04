import { t } from "adorn-api";
import {
  createOptionDto,
  createOptionsArraySchema,
  createPagedFilterSortingQueryDtoClass,
  type SortingQueryParams
} from "../common";

const TipoProvidenciaJuridicaOptionDtoClass = createOptionDto(
  "TipoProvidenciaJuridicaOptionDto",
  "Tipo de providência jurídica com id e nome."
);
export { TipoProvidenciaJuridicaOptionDtoClass as TipoProvidenciaJuridicaOptionDto };
export type TipoProvidenciaJuridicaOptionDto = InstanceType<typeof TipoProvidenciaJuridicaOptionDtoClass>;

export const TipoProvidenciaJuridicaQueryDtoClass = createPagedFilterSortingQueryDtoClass({
  name: "TipoProvidenciaJuridicaQueryDto",
  filters: {
    nomeContains: { schema: t.string({ minLength: 1 }), operator: "contains" }
  }
});

export interface TipoProvidenciaJuridicaQueryDto extends SortingQueryParams {
  page?: number;
  pageSize?: number;
  nomeContains?: string;
}

export const TipoProvidenciaJuridicaOptionsDto = createOptionsArraySchema(
  TipoProvidenciaJuridicaOptionDtoClass,
  "Lista de tipos de providência jurídica com id e nome."
);
