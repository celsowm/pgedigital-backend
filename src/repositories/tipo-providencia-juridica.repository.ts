import { entityRef, selectFromEntity } from "metal-orm";
import { TipoProvidenciaJuridica } from "../entities/TipoProvidenciaJuridica";

const T = entityRef(TipoProvidenciaJuridica);

export type TipoProvidenciaJuridicaFilterFields = "nome";

export const TIPO_PROVIDENCIA_JURIDICA_FILTER_MAPPINGS = {
  nomeContains: { field: "nome", operator: "contains" }
} satisfies Record<string, { field: TipoProvidenciaJuridicaFilterFields; operator: "equals" | "contains" }>;

export class TipoProvidenciaJuridicaRepository {
  readonly entityClass = TipoProvidenciaJuridica;
  readonly entityRef: any = T;

  buildOptionsQuery(labelField = "nome"): any {
    const labelRef = (this.entityRef as any)[labelField];
    return (selectFromEntity(this.entityClass) as any)
      .select({ id: this.entityRef.id, nome: labelRef })
      .orderBy(labelRef, "ASC");
  }
}

