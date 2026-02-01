import { entityRef, selectFromEntity, type OrmSession } from "metal-orm";
import { ExitoSucumbencia } from "../entities/ExitoSucumbencia";

const E = entityRef(ExitoSucumbencia);

export type ExitoSucumbenciaFilterFields = "nome";

export const EXITO_SUCUMBENCIA_FILTER_MAPPINGS = {
  nomeContains: { field: "nome", operator: "contains" }
} satisfies Record<string, { field: ExitoSucumbenciaFilterFields; operator: "equals" | "contains" }>;

export class ExitoSucumbenciaRepository {
  readonly entityClass = ExitoSucumbencia;
  readonly entityRef: any = E;

  buildListQuery(): any {
    return selectFromEntity(ExitoSucumbencia).orderBy(this.entityRef.id, "ASC");
  }

  buildOptionsQuery(labelField = "nome"): any {
    const labelRef = (this.entityRef as any)[labelField];
    return (selectFromEntity(this.entityClass) as any)
      .select({ id: this.entityRef.id, nome: labelRef })
      .orderBy(labelRef, "ASC");
  }

  async findById(session: OrmSession, id: number): Promise<ExitoSucumbencia | null> {
    return session.find(this.entityClass, id);
  }
}

