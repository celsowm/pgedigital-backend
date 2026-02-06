import { eq, selectFromEntity, type OrmSession } from "metal-orm";
import { Feriado } from "../entities/Feriado";
import { BaseRepository, createFilterMappings } from "./base.repository";

export const FERIADO_FILTER_MAPPINGS = createFilterMappings<Record<string, unknown>>({
  descricaoContains: { field: "descricao", operator: "contains" },
  dataInicioGte: { field: "data_inicio", operator: "gte" },
  dataFimLte: { field: "data_fim", operator: "lte" },
  tribunalId: { field: "tribunal_id", operator: "equals" }
});

export class FeriadoRepository extends BaseRepository<Feriado> {
  readonly entityClass = Feriado;

  constructor() {
    super({ defaultLabelField: "descricao" });
  }

  override buildListQuery(): ReturnType<typeof selectFromEntity<Feriado>> {
    return selectFromEntity(Feriado)
      .includePick("tribunal", ["id", "descricao", "sigla"]);
  }

  async getDetail(session: OrmSession, id: number): Promise<Feriado | null> {
    const [feriado] = await selectFromEntity(Feriado)
      .includePick("tribunal", ["id", "descricao", "sigla"])
      .where(eq(this.entityRef.id, id))
      .execute(session);
    return feriado ?? null;
  }
}
