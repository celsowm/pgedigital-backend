import { eq, selectFromEntity, type OrmSession } from "metal-orm";
import { Equipe } from "../entities/Equipe";
import { BaseRepository, createFilterMappings } from "./base.repository";

export type EquipeFilterFields = "nome" | "especializada_id";

export const EQUIPE_FILTER_MAPPINGS = createFilterMappings<EquipeFilterFields>({
  nomeContains: { field: "nome", operator: "contains" },
  especializadaId: { field: "especializada_id", operator: "equals" }
});

export class EquipeRepository extends BaseRepository<Equipe> {
  readonly entityClass = Equipe;

  override buildListQuery(): ReturnType<typeof selectFromEntity<Equipe>> {
    return selectFromEntity(Equipe)
      .includePick("especializada", ["id", "nome"])
      .orderBy(this.entityRef.id, "ASC");
  }

  async getWithEspecializada(session: OrmSession, id: number): Promise<Equipe | null> {
    const [equipe] = await selectFromEntity(Equipe)
      .includePick("especializada", ["id", "nome"])
      .where(eq(this.entityRef.id, id))
      .execute(session);
    return equipe ?? null;
  }
}
