import { entityRef, selectFromEntity, type OrmSession } from "metal-orm";
import { Classificacao } from "../entities/Classificacao";

const C = entityRef(Classificacao);

export type ClassificacaoFilterFields = "nome";

export const CLASSIFICACAO_FILTER_MAPPINGS = {
  nomeContains: { field: "nome", operator: "contains" }
} satisfies Record<string, { field: ClassificacaoFilterFields; operator: "equals" | "contains" }>;

export class ClassificacaoRepository {
  readonly entityClass = Classificacao;
  readonly entityRef: any = C;

  buildListQuery(): any {
    return selectFromEntity(Classificacao).orderBy(this.entityRef.id, "ASC");
  }

  buildOptionsQuery(labelField = "nome"): any {
    const labelRef = (this.entityRef as any)[labelField];
    return (selectFromEntity(this.entityClass) as any)
      .select({ id: this.entityRef.id, nome: labelRef })
      .orderBy(labelRef, "ASC");
  }

  async findById(session: OrmSession, id: number): Promise<Classificacao | null> {
    return session.find(this.entityClass, id);
  }
}

