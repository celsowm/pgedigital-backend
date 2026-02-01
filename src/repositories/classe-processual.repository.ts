import { entityRef, selectFromEntity, type OrmSession } from "metal-orm";
import { ClasseProcessual } from "../entities/ClasseProcessual";

const C = entityRef(ClasseProcessual);

export type ClasseProcessualFilterFields = "nome";

export const CLASSE_PROCESSUAL_FILTER_MAPPINGS = {
  nomeContains: { field: "nome", operator: "contains" }
} satisfies Record<string, { field: ClasseProcessualFilterFields; operator: "equals" | "contains" }>;

export class ClasseProcessualRepository {
  readonly entityClass = ClasseProcessual;
  readonly entityRef: any = C;

  buildListQuery(): any {
    return selectFromEntity(ClasseProcessual).orderBy(this.entityRef.id, "ASC");
  }

  buildOptionsQuery(labelField = "nome"): any {
    const labelRef = (this.entityRef as any)[labelField];
    return (selectFromEntity(this.entityClass) as any)
      .select({ id: this.entityRef.id, nome: labelRef })
      .orderBy(labelRef, "ASC");
  }

  async findById(session: OrmSession, id: number): Promise<ClasseProcessual | null> {
    return session.find(this.entityClass, id);
  }
}

