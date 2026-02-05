import { eq, selectFromEntity, type OrmSession } from "metal-orm";
import { Tema } from "../entities/Tema";
import type { TemaWithRelationsDto } from "../dtos/tema/tema.dtos";
import { BaseRepository, createFilterMappings } from "./base.repository";

export type TemaFilterFields = "nome" | "materia_id" | "parent_id";

export const TEMA_FILTER_MAPPINGS = createFilterMappings<Record<string, unknown>>({
  nomeContains: { field: "nome", operator: "contains" },
  materiaId: { field: "materia_id", operator: "equals" },
  parentId: { field: "parent_id", operator: "equals" }
});

export class TemaRepository extends BaseRepository<Tema> {
  readonly entityClass = Tema;

  async getWithRelations(session: OrmSession, id: number): Promise<TemaWithRelationsDto | null> {
    const [tema] = await selectFromEntity(Tema)
      .includePick("materia", ["id", "nome"])
      .where(eq(this.entityRef.id, id))
      .execute(session);
    return (tema ?? null) as TemaWithRelationsDto | null;
  }
}
