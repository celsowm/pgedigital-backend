import { ProcessoAdministrativo } from "../entities/ProcessoAdministrativo";
import { BaseRepository, createFilterMappings } from "./base.repository";

export type ProcessoAdministrativoFilterFields = "codigoPa" | "tipoProcessoAdministrativoId";

export const PROCESSO_ADMINISTRATIVO_FILTER_MAPPINGS = createFilterMappings<Record<string, unknown>>({
  codigoPa: { field: "codigo_pa", operator: "equals" },
  tipoProcessoAdministrativoId: { field: "tipo_processo_administrativo_id", operator: "equals" }
});

export class ProcessoAdministrativoRepository extends BaseRepository<ProcessoAdministrativo> {
  readonly entityClass = ProcessoAdministrativo;
}
