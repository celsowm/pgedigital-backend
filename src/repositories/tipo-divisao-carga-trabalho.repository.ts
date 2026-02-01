import { entityRef, selectFromEntity } from "metal-orm";
import { TipoDivisaoCargaTrabalho } from "../entities/TipoDivisaoCargaTrabalho";

const T = entityRef(TipoDivisaoCargaTrabalho);

export type TipoDivisaoCargaTrabalhoFilterFields = "nome";

export const TIPO_DIVISAO_CARGA_TRABALHO_FILTER_MAPPINGS = {
  nomeContains: { field: "nome", operator: "contains" }
} satisfies Record<string, { field: TipoDivisaoCargaTrabalhoFilterFields; operator: "equals" | "contains" }>;

export class TipoDivisaoCargaTrabalhoRepository {
  readonly entityClass = TipoDivisaoCargaTrabalho;
  readonly entityRef: any = T;

  buildOptionsQuery(labelField = "nome"): any {
    const labelRef = (this.entityRef as any)[labelField];
    return (selectFromEntity(this.entityClass) as any)
      .select({ id: this.entityRef.id, nome: labelRef })
      .orderBy(labelRef, "ASC");
  }
}

