import { NotaVersao } from "../entities/NotaVersao";
import { BaseRepository, createFilterMappings } from "./base.repository";

export type NotaVersaoFilterFields = "sprint" | "ativo" | "mensagem";

export const NOTA_VERSAO_FILTER_MAPPINGS = createFilterMappings<NotaVersaoFilterFields>({
  sprint: { field: "sprint", operator: "equals" },
  ativo: { field: "ativo", operator: "equals" },
  mensagemContains: { field: "mensagem", operator: "contains" }
});

export class NotaVersaoRepository extends BaseRepository<NotaVersao> {
  readonly entityClass = NotaVersao;
}
