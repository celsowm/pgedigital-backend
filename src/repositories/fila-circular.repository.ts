import { entityRef, selectFromEntity, type OrmSession } from "metal-orm";
import { FilaCircular } from "../entities/FilaCircular";

const F = entityRef(FilaCircular);

export type FilaCircularFilterFields = never;

export const FILA_CIRCULAR_FILTER_MAPPINGS = {} satisfies Record<
  string,
  { field: FilaCircularFilterFields; operator: "equals" | "contains" }
>;

export class FilaCircularRepository {
  readonly entityClass = FilaCircular;
  readonly entityRef: any = F;

  buildListQuery(): any {
    return selectFromEntity(FilaCircular).orderBy(this.entityRef.id, "ASC");
  }

  buildOptionsQuery(labelField = "ultimo_elemento"): any {
    const labelRef = (this.entityRef as any)[labelField];
    return (selectFromEntity(this.entityClass) as any)
      .select({ id: this.entityRef.id, nome: labelRef })
      .orderBy(labelRef, "ASC");
  }

  async findById(session: OrmSession, id: number): Promise<FilaCircular | null> {
    return session.find(this.entityClass, id);
  }
}

