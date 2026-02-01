import { TipoAcervo } from "../entities/TipoAcervo";
import { BaseRepository, createFilterMappings } from "./base.repository";

export type TipoAcervoFilterFields = "nome";

export const TIPO_ACERVO_FILTER_MAPPINGS = createFilterMappings<TipoAcervoFilterFields>({
  nomeContains: { field: "nome", operator: "contains" }
});

export class TipoAcervoRepository extends BaseRepository<TipoAcervo> {
  readonly entityClass = TipoAcervo;
}
