import { entityRef, selectFromEntity } from "metal-orm";
import { TipoSolicitacao } from "../entities/TipoSolicitacao";

const T = entityRef(TipoSolicitacao);

export type TipoSolicitacaoFilterFields = "nome" | "solicitacao_externa";

export const TIPO_SOLICITACAO_FILTER_MAPPINGS = {
  nomeContains: { field: "nome", operator: "contains" },
  solicitacaoExterna: { field: "solicitacao_externa", operator: "equals" }
} satisfies Record<string, { field: TipoSolicitacaoFilterFields; operator: "equals" | "contains" }>;

export class TipoSolicitacaoRepository {
  readonly entityClass = TipoSolicitacao;
  readonly entityRef: any = T;

  buildListQuery(): any {
    return selectFromEntity(TipoSolicitacao).orderBy(this.entityRef.id, "ASC");
  }

  buildOptionsQuery(labelField = "nome"): any {
    const labelRef = (this.entityRef as any)[labelField];
    return (selectFromEntity(this.entityClass) as any)
      .select({ id: this.entityRef.id, nome: labelRef })
      .orderBy(labelRef, "ASC");
  }
}

