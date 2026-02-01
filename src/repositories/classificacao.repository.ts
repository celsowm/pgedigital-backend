import { Classificacao } from "../entities/Classificacao";
import { BaseRepository, createFilterMappings } from "./base.repository";

export type ClassificacaoFilterFields = "nome";

export const CLASSIFICACAO_FILTER_MAPPINGS = createFilterMappings<ClassificacaoFilterFields>({
  nomeContains: { field: "nome", operator: "contains" }
});

export class ClassificacaoRepository extends BaseRepository<Classificacao> {
  readonly entityClass = Classificacao;
}
