import { TipoAfastamento } from "../entities/TipoAfastamento";
import { BaseRepository, createFilterMappings } from "./base.repository";

export type TipoAfastamentoFilterFields = "nome";

export const TIPO_AFASTAMENTO_FILTER_MAPPINGS = createFilterMappings<Record<string, unknown>>({
  nomeContains: { field: "nome", operator: "contains" }
});

export class TipoAfastamentoRepository extends BaseRepository<TipoAfastamento> {
  readonly entityClass = TipoAfastamento;
}
