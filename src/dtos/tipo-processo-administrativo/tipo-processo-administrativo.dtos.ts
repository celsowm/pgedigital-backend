import { createPagedFilterQueryDtoClass, t } from "adorn-api";
import { createOptionDto, createOptionsArraySchema } from "../common";

const TipoProcessoAdministrativoOptionDtoClass = createOptionDto(
  "TipoProcessoAdministrativoOptionDto",
  "Tipo de processo administrativo com id e nome."
);
export { TipoProcessoAdministrativoOptionDtoClass as TipoProcessoAdministrativoOptionDto };
export type TipoProcessoAdministrativoOptionDto = InstanceType<typeof TipoProcessoAdministrativoOptionDtoClass>;

export const TipoProcessoAdministrativoQueryDtoClass = createPagedFilterQueryDtoClass({
  name: "TipoProcessoAdministrativoQueryDto",
  filters: {
    nomeContains: { schema: t.string({ minLength: 1 }), operator: "contains" }
  }
});

export interface TipoProcessoAdministrativoQueryDto {
  page?: number;
  pageSize?: number;
  nomeContains?: string;
}

export const TipoProcessoAdministrativoOptionsDto = createOptionsArraySchema(
  TipoProcessoAdministrativoOptionDtoClass,
  "Lista de tipos de processo administrativo com id e nome."
);
