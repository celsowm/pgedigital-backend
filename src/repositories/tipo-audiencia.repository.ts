import { entityRef, selectFromEntity } from "metal-orm";
import { TipoAudiencia } from "../entities/TipoAudiencia";

const T = entityRef(TipoAudiencia);

export type TipoAudienciaFilterFields = "descricao" | "tipo_processo_administrativo_id";

export const TIPO_AUDIENCIA_FILTER_MAPPINGS = {
  descricaoContains: { field: "descricao", operator: "contains" },
  tipoProcessoAdministrativoId: { field: "tipo_processo_administrativo_id", operator: "equals" }
} satisfies Record<string, { field: TipoAudienciaFilterFields; operator: "equals" | "contains" }>;

export class TipoAudienciaRepository {
  readonly entityClass = TipoAudiencia;
  readonly entityRef: any = T;

  buildListQuery(): any {
    return selectFromEntity(TipoAudiencia).orderBy(this.entityRef.id, "ASC");
  }

  buildOptionsQuery(labelField = "descricao"): any {
    const labelRef = (this.entityRef as any)[labelField];
    return (selectFromEntity(this.entityClass) as any)
      .select({ id: this.entityRef.id, nome: labelRef })
      .orderBy(labelRef, "ASC");
  }
}

