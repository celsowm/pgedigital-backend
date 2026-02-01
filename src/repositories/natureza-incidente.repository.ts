import { entityRef, selectFromEntity, type OrmSession } from "metal-orm";
import { NaturezaIncidente } from "../entities/NaturezaIncidente";

const N = entityRef(NaturezaIncidente);

export type NaturezaIncidenteFilterFields = "nome";

export const NATUREZA_INCIDENTE_FILTER_MAPPINGS = {
  nomeContains: { field: "nome", operator: "contains" }
} satisfies Record<string, { field: NaturezaIncidenteFilterFields; operator: "equals" | "contains" }>;

export class NaturezaIncidenteRepository {
  readonly entityClass = NaturezaIncidente;
  readonly entityRef: any = N;

  buildListQuery(): any {
    return selectFromEntity(NaturezaIncidente).orderBy(this.entityRef.id, "ASC");
  }

  buildOptionsQuery(labelField = "nome"): any {
    const labelRef = (this.entityRef as any)[labelField];
    return (selectFromEntity(this.entityClass) as any)
      .select({ id: this.entityRef.id, nome: labelRef })
      .orderBy(labelRef, "ASC");
  }

  async findById(session: OrmSession, id: number): Promise<NaturezaIncidente | null> {
    return session.find(this.entityClass, id);
  }
}

