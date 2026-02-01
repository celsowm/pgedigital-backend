import { entityRef, selectFromEntity, type OrmSession } from "metal-orm";
import { TipoAcervo } from "../entities/TipoAcervo";

const T = entityRef(TipoAcervo);

export type TipoAcervoFilterFields = "nome";

export const TIPO_ACERVO_FILTER_MAPPINGS = {
  nomeContains: { field: "nome", operator: "contains" }
} satisfies Record<string, { field: TipoAcervoFilterFields; operator: "equals" | "contains" }>;

export class TipoAcervoRepository {
  readonly entityClass = TipoAcervo;
  readonly entityRef: any = T;

  buildListQuery(): any {
    return selectFromEntity(TipoAcervo).orderBy(this.entityRef.id, "ASC");
  }

  buildOptionsQuery(labelField = "nome"): any {
    const labelRef = (this.entityRef as any)[labelField];
    return (selectFromEntity(this.entityClass) as any)
      .select({ id: this.entityRef.id, nome: labelRef })
      .orderBy(labelRef, "ASC");
  }

  async findById(session: OrmSession, id: number): Promise<TipoAcervo | null> {
    return session.find(this.entityClass, id);
  }
}

