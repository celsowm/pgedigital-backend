import { Pessoa } from "../entities/Pessoa";
import { BaseRepository, createFilterMappings } from "./base.repository";

export type PessoaFilterFields = "nome" | "numero_documento_principal";

export const PESSOA_FILTER_MAPPINGS = createFilterMappings<PessoaFilterFields>({
  nomeContains: { field: "nome", operator: "contains" },
  numeroDocumentoPrincipalContains: { field: "numero_documento_principal", operator: "contains" }
});

export class PessoaRepository extends BaseRepository<Pessoa> {
  readonly entityClass = Pessoa;
}
