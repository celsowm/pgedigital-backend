import { eq, selectFromEntity, type OrmSession } from "metal-orm";
import { Acervo } from "../entities/Acervo";
import type { AcervoDetailDto, AcervoWithRelationsDto } from "../dtos/acervo/acervo.dtos";
import { BaseRepository, createFilterMappings } from "./base.repository";

export type AcervoFilterFields =
  | "nome"
  | "especializada_id"
  | "tipo_acervo_id"
  | "procurador_titular_id"
  | "ativo";

export const ACERVO_FILTER_MAPPINGS = createFilterMappings<Record<string, unknown>>({
  nomeContains: { field: "nome", operator: "contains" },
  especializadaId: { field: "especializada_id", operator: "equals" },
  tipoAcervoId: { field: "tipo_acervo_id", operator: "equals" },
  procuradorTitularId: { field: "procurador_titular_id", operator: "equals" },
  procuradorTitularNomeContains: { field: "procuradorTitular.some.nome", operator: "contains" },
  ativo: { field: "ativo", operator: "equals" }
});

export class AcervoRepository extends BaseRepository<Acervo, AcervoDetailDto> {
  readonly entityClass = Acervo;

  override buildListQuery(): ReturnType<typeof selectFromEntity<Acervo>> {
    return selectFromEntity(Acervo)
      .includePick("especializada", ["id", "nome"])
      .include("procuradorTitular", { columns: ["id", "nome"] })
      .includePick("tipoAcervo", ["id", "nome"]);
  }

  buildBaseRelationsQuery(): ReturnType<typeof selectFromEntity<Acervo>> {
    return selectFromEntity(Acervo)
      .includePick("especializada", ["id", "nome"])
      .include("procuradorTitular", { columns: ["id", "nome"] })
      .includePick("tipoAcervo", ["id", "nome"])
      .includePick("tipoMigracaoAcervo", ["id", "nome"])
      .includePick("equipeResponsavel", ["id", "nome"])
      .includePick("tipoDivisaoCargaTrabalho", ["id", "nome"]);
  }

  buildDetailQuery(): ReturnType<typeof selectFromEntity<Acervo>> {
    return this.buildBaseRelationsQuery()
      .include("equipes", { columns: ["id", "nome"], include: { especializada: { columns: ["id", "nome"] } } })
      .include("classificacoes", { columns: ["id", "nome"] })
      .include("temasRelacionados", { columns: ["id", "nome"], include: { materia: { columns: ["nome"] } } })
      .include("destinatarios", {
        columns: ["id", "nome", "login", "cargo", "estado_inatividade"],
        include: { especializada: { columns: ["id", "nome"] } }
      })
      .include("raizesCNPJs", { pivot: { columns: ["id", "raiz"] } });
  }

  async getWithRelations(session: OrmSession, id: number): Promise<AcervoWithRelationsDto | null> {
    const [acervo] = await this.buildBaseRelationsQuery()
      .where(eq(this.entityRef.id, id))
      .execute(session);
    return (acervo ?? null) as AcervoWithRelationsDto | null;
  }

  override async getDetail(session: OrmSession, id: number): Promise<AcervoDetailDto | null> {
    const [acervo] = await this.buildDetailQuery()
      .where(eq(this.entityRef.id, id))
      .execute(session);
    return (acervo ?? null) as AcervoDetailDto | null;
  }
}
