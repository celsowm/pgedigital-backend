import { BaseRepository, createFilterMappings } from "./base.repository";
import { PalavraChave } from "../entities/PalavraChave";

export type PalavraChaveFilterFields = "palavra" | "obrigatoriedade";

export const PALAVRA_CHAVE_FILTER_MAPPINGS = createFilterMappings<Record<string, unknown>>({
    palavraContains: { field: "palavra", operator: "contains" },
    obrigatoriedade: { field: "obrigatoriedade", operator: "equals" }
});

export class PalavraChaveRepository extends BaseRepository<PalavraChave> {
    readonly entityClass = PalavraChave;

    constructor() {
        super({ defaultLabelField: "palavra" });
    }
}
