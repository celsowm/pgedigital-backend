import { NaturezaIncidente } from "../entities/NaturezaIncidente";
import { BaseRepository, createFilterMappings } from "./base.repository";

export type NaturezaIncidenteFilterFields = "nome";

export const NATUREZA_INCIDENTE_FILTER_MAPPINGS = createFilterMappings<NaturezaIncidenteFilterFields>({
  nomeContains: { field: "nome", operator: "contains" }
});

export class NaturezaIncidenteRepository extends BaseRepository<NaturezaIncidente> {
  readonly entityClass = NaturezaIncidente;
}
