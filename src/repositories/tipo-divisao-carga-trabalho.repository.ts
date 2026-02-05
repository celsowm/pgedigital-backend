import { TipoDivisaoCargaTrabalho } from "../entities/TipoDivisaoCargaTrabalho";
import { BaseRepository, createFilterMappings } from "./base.repository";

export type TipoDivisaoCargaTrabalhoFilterFields = "nome";

export const TIPO_DIVISAO_CARGA_TRABALHO_FILTER_MAPPINGS = createFilterMappings<Record<string, unknown>>({
  nomeContains: { field: "nome", operator: "contains" }
});

export class TipoDivisaoCargaTrabalhoRepository extends BaseRepository<TipoDivisaoCargaTrabalho> {
  readonly entityClass = TipoDivisaoCargaTrabalho;
}
