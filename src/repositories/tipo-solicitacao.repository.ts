import { TipoSolicitacao } from "../entities/TipoSolicitacao";
import { BaseRepository, createFilterMappings } from "./base.repository";

export type TipoSolicitacaoFilterFields = "nome" | "solicitacao_externa";

export const TIPO_SOLICITACAO_FILTER_MAPPINGS = createFilterMappings<Record<string, unknown>>({
  nomeContains: { field: "nome", operator: "contains" },
  solicitacaoExterna: { field: "solicitacao_externa", operator: "equals" }
});

export class TipoSolicitacaoRepository extends BaseRepository<TipoSolicitacao> {
  readonly entityClass = TipoSolicitacao;
}
