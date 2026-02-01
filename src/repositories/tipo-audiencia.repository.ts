import { TipoAudiencia } from "../entities/TipoAudiencia";
import { BaseRepository, createFilterMappings } from "./base.repository";

export type TipoAudienciaFilterFields = "descricao" | "tipo_processo_administrativo_id";

export const TIPO_AUDIENCIA_FILTER_MAPPINGS = createFilterMappings<TipoAudienciaFilterFields>({
  descricaoContains: { field: "descricao", operator: "contains" },
  tipoProcessoAdministrativoId: { field: "tipo_processo_administrativo_id", operator: "equals" }
});

export class TipoAudienciaRepository extends BaseRepository<TipoAudiencia> {
  readonly entityClass = TipoAudiencia;

  constructor() {
    super({ defaultLabelField: "descricao" });
  }
}
