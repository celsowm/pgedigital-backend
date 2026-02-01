import { entityRef, selectFromEntity, type OrmSession } from "metal-orm";
import { Materia } from "../entities/Materia";

const M = entityRef(Materia);

export type MateriaFilterFields = "nome";

export const MATERIA_FILTER_MAPPINGS = {
  nomeContains: { field: "nome", operator: "contains" }
} satisfies Record<string, { field: MateriaFilterFields; operator: "equals" | "contains" }>;

export class MateriaRepository {
  readonly entityClass = Materia;
  readonly entityRef: any = M;

  buildListQuery(): any {
    return selectFromEntity(Materia).orderBy(this.entityRef.id, "ASC");
  }

  buildOptionsQuery(labelField = "nome"): any {
    const labelRef = (this.entityRef as any)[labelField];
    return (selectFromEntity(this.entityClass) as any)
      .select({ id: this.entityRef.id, nome: labelRef })
      .orderBy(labelRef, "ASC");
  }

  async findById(session: OrmSession, id: number): Promise<Materia | null> {
    return session.find(this.entityClass, id);
  }
}

