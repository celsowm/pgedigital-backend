import { TipoProvidenciaJuridica } from "../entities/TipoProvidenciaJuridica";
import { BaseRepository, createFilterMappings } from "./base.repository";

export type TipoProvidenciaJuridicaFilterFields = "nome";

export const TIPO_PROVIDENCIA_JURIDICA_FILTER_MAPPINGS = createFilterMappings<Record<string, unknown>>({
  nomeContains: { field: "nome", operator: "contains" }
});

export class TipoProvidenciaJuridicaRepository extends BaseRepository<TipoProvidenciaJuridica> {
  readonly entityClass = TipoProvidenciaJuridica;
}
