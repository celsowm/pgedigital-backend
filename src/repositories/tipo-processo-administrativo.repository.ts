import { entityRef, selectFromEntity } from "metal-orm";
import { TipoProcessoAdministrativo } from "../entities/TipoProcessoAdministrativo";

const T = entityRef(TipoProcessoAdministrativo);

export type TipoProcessoAdministrativoFilterFields = "nome";

export const TIPO_PROCESSO_ADMINISTRATIVO_FILTER_MAPPINGS = {
  nomeContains: { field: "nome", operator: "contains" }
} satisfies Record<string, { field: TipoProcessoAdministrativoFilterFields; operator: "equals" | "contains" }>;

export class TipoProcessoAdministrativoRepository {
  readonly entityClass = TipoProcessoAdministrativo;
  readonly entityRef: any = T;

  buildOptionsQuery(labelField = "nome"): any {
    const labelRef = (this.entityRef as any)[labelField];
    return (selectFromEntity(this.entityClass) as any)
      .select({ id: this.entityRef.id, nome: labelRef })
      .orderBy(labelRef, "ASC");
  }
}

