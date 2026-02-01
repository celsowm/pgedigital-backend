import { entityRef, eq, selectFromEntity, type OrmSession } from "metal-orm";
import { Equipe } from "../entities/Equipe";

const E = entityRef(Equipe);

export type EquipeFilterFields = "nome" | "especializada_id";

export const EQUIPE_FILTER_MAPPINGS = {
  nomeContains: { field: "nome", operator: "contains" },
  especializadaId: { field: "especializada_id", operator: "equals" }
} satisfies Record<string, { field: EquipeFilterFields; operator: "equals" | "contains" }>;

export class EquipeRepository {
  readonly entityClass = Equipe;
  readonly entityRef: any = E;

  buildListQuery(): any {
    return selectFromEntity(Equipe)
      .includePick("especializada", ["id", "nome"])
      .orderBy(this.entityRef.id, "ASC");
  }

  buildOptionsQuery(labelField = "nome"): any {
    const labelRef = (this.entityRef as any)[labelField];
    return (selectFromEntity(this.entityClass) as any)
      .select({ id: this.entityRef.id, nome: labelRef })
      .orderBy(labelRef, "ASC");
  }

  async getWithEspecializada(session: OrmSession, id: number): Promise<Equipe | null> {
    const [equipe] = await selectFromEntity(Equipe)
      .includePick("especializada", ["id", "nome"])
      .where(eq(this.entityRef.id, id))
      .execute(session);
    return equipe ?? null;
  }

  async findById(session: OrmSession, id: number): Promise<Equipe | null> {
    return session.find(this.entityClass, id);
  }
}

