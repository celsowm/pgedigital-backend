import { createOptionDto, createOptionsArraySchema } from "../common";

const TipoMigracaoAcervoOptionDtoClass = createOptionDto(
  "TipoMigracaoAcervoOptionDto",
  "Tipo de migração de acervo com id e nome."
);
export { TipoMigracaoAcervoOptionDtoClass as TipoMigracaoAcervoOptionDto };
export type TipoMigracaoAcervoOptionDto = InstanceType<typeof TipoMigracaoAcervoOptionDtoClass>;

export const TipoMigracaoAcervoOptionsDto = createOptionsArraySchema(
  TipoMigracaoAcervoOptionDtoClass,
  "Lista de tipos de migração de acervo com id e nome."
);
