import { createOptionDto, createOptionsArraySchema } from "../common";

const TipoProcessoAdministrativoOptionDtoClass = createOptionDto(
  "TipoProcessoAdministrativoOptionDto",
  "Tipo de processo administrativo com id e nome."
);
export { TipoProcessoAdministrativoOptionDtoClass as TipoProcessoAdministrativoOptionDto };
export type TipoProcessoAdministrativoOptionDto = InstanceType<typeof TipoProcessoAdministrativoOptionDtoClass>;

export const TipoProcessoAdministrativoOptionsDto = createOptionsArraySchema(
  TipoProcessoAdministrativoOptionDtoClass,
  "Lista de tipos de processo administrativo com id e nome."
);
