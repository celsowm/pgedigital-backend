import { MniTribunal } from "../entities/MniTribunal";
import { BaseRepository, createFilterMappings } from "./base.repository";

export type MniTribunalFilterFields = "sigla" | "descricao" | "identificador_cnj";

export const MNI_TRIBUNAL_FILTER_MAPPINGS = createFilterMappings<MniTribunalFilterFields>({
  descricaoContains: { field: "descricao", operator: "contains" },
  siglaContains: { field: "sigla", operator: "contains" },
  identificadorCnjEquals: { field: "identificador_cnj", operator: "equals" }
});

export class MniTribunalRepository extends BaseRepository<MniTribunal> {
  readonly entityClass = MniTribunal;

  constructor() {
    super({ defaultLabelField: "descricao" });
  }
}
