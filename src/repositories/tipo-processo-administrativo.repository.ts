import { TipoProcessoAdministrativo } from "../entities/TipoProcessoAdministrativo";
import { BaseRepository, createFilterMappings } from "./base.repository";

export type TipoProcessoAdministrativoFilterFields = "nome";

export const TIPO_PROCESSO_ADMINISTRATIVO_FILTER_MAPPINGS = createFilterMappings<Record<string, unknown>>({
  nomeContains: { field: "nome", operator: "contains" }
});

export class TipoProcessoAdministrativoRepository extends BaseRepository<TipoProcessoAdministrativo> {
  readonly entityClass = TipoProcessoAdministrativo;
}
