import { entityRef, selectFromEntity, type OrmSession } from "metal-orm";
import { TipoAfastamento } from "../entities/TipoAfastamento";

const T = entityRef(TipoAfastamento);

export type TipoAfastamentoFilterFields = "nome";

export const TIPO_AFASTAMENTO_FILTER_MAPPINGS = {
  nomeContains: { field: "nome", operator: "contains" }
} satisfies Record<string, { field: TipoAfastamentoFilterFields; operator: "equals" | "contains" }>;

export class TipoAfastamentoRepository {
  readonly entityClass = TipoAfastamento;
  readonly entityRef: any = T;

  buildListQuery(): any {
    return selectFromEntity(TipoAfastamento).orderBy(this.entityRef.id, "ASC");
  }

  buildOptionsQuery(labelField = "nome"): any {
    const labelRef = (this.entityRef as any)[labelField];
    return (selectFromEntity(this.entityClass) as any)
      .select({ id: this.entityRef.id, nome: labelRef })
      .orderBy(labelRef, "ASC");
  }

  async findById(session: OrmSession, id: number): Promise<TipoAfastamento | null> {
    return session.find(this.entityClass, id);
  }
}

