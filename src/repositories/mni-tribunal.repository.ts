import { entityRef, selectFromEntity, type OrmSession } from "metal-orm";
import { MniTribunal } from "../entities/MniTribunal";

const M = entityRef(MniTribunal);

export type MniTribunalFilterFields = "sigla" | "descricao" | "identificador_cnj";

export const MNI_TRIBUNAL_FILTER_MAPPINGS = {
  descricaoContains: { field: "descricao", operator: "contains" },
  siglaContains: { field: "sigla", operator: "contains" },
  identificadorCnjEquals: { field: "identificador_cnj", operator: "equals" }
} satisfies Record<string, { field: MniTribunalFilterFields; operator: "equals" | "contains" }>;

export class MniTribunalRepository {
  readonly entityClass = MniTribunal;
  readonly entityRef: any = M;

  buildListQuery(): any {
    return selectFromEntity(MniTribunal).orderBy(this.entityRef.id, "ASC");
  }

  buildOptionsQuery(labelField = "descricao"): any {
    const labelRef = (this.entityRef as any)[labelField];
    return (selectFromEntity(this.entityClass) as any)
      .select({ id: this.entityRef.id, nome: labelRef })
      .orderBy(labelRef, "ASC");
  }

  async findById(session: OrmSession, id: number): Promise<MniTribunal | null> {
    return session.find(this.entityClass, id);
  }
}

