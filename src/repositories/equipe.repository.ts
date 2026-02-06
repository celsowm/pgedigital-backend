import { eq, selectFromEntity, type OrmSession } from "metal-orm";
import { Equipe } from "../entities/Equipe";
import type { EquipeWithEspecializadaDto } from "../dtos/equipe/equipe.dtos";
import { BaseRepository, createFilterMappings } from "./base.repository";

export type EquipeFilterFields = "nome" | "especializada_id";

export const EQUIPE_FILTER_MAPPINGS = createFilterMappings<Record<string, unknown>>({
  nomeContains: { field: "nome", operator: "contains" },
  especializadaId: { field: "especializada_id", operator: "equals" }
});

export class EquipeRepository extends BaseRepository<Equipe, EquipeWithEspecializadaDto> {
  readonly entityClass = Equipe;

  override buildListQuery(): ReturnType<typeof selectFromEntity<Equipe>> {
    return selectFromEntity(Equipe)
      .includePick("especializada", ["id", "nome"]);
  }

  async getWithEspecializada(session: OrmSession, id: number): Promise<Equipe | null> {
    const [equipe] = await selectFromEntity(Equipe)
      .includePick("especializada", ["id", "nome"])
      .where(eq(this.entityRef.id, id))
      .execute(session);
    return equipe ?? null;
  }

  override async getDetail(session: OrmSession, id: number): Promise<EquipeWithEspecializadaDto | null> {
    return (await this.getWithEspecializada(session, id)) as EquipeWithEspecializadaDto | null;
  }
}
