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

export const ACERVO_FILTER_MAPPINGS = createFilterMappings<AcervoFilterFields>({
  nomeContains: { field: "nome", operator: "contains" },
  especializadaId: { field: "especializada_id", operator: "equals" },
  tipoAcervoId: { field: "tipo_acervo_id", operator: "equals" },
  procuradorTitularId: { field: "procurador_titular_id", operator: "equals" },
  ativo: { field: "ativo", operator: "equals" }
});

export type ProcuradorTitularFilterFields = "nome";

export const PROCURADOR_TITULAR_FILTER_MAPPINGS = createFilterMappings<ProcuradorTitularFilterFields>({
  procuradorTitularNomeContains: { field: "nome", operator: "contains" }
});

export class AcervoRepository extends BaseRepository<Acervo> {
  readonly entityClass = Acervo;

  override buildListQuery(): ReturnType<typeof selectFromEntity<Acervo>> {
    return selectFromEntity(Acervo)
      .includePick("especializada", ["id", "nome"])
      .include("procuradorTitular", { columns: ["id", "nome"], include: { usuarioThumbnail: { columns: ["id", "thumbnail"] } } })
      .includePick("tipoAcervo", ["id", "nome"]);
  }

  buildBaseRelationsQuery(): ReturnType<typeof selectFromEntity<Acervo>> {
    return selectFromEntity(Acervo)
      .includePick("especializada", ["id", "nome"])
      .include("procuradorTitular", { columns: ["id", "nome"], include: { usuarioThumbnail: { columns: ["id", "thumbnail"] } } })
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
        include: { especializada: { columns: ["id", "nome"] }, usuarioThumbnail: { columns: ["id", "thumbnail"] } }
      })
      .include("raizesCNPJs", { pivot: { columns: ["id", "raiz"] } });
  }

  async getWithRelations(session: OrmSession, id: number): Promise<AcervoWithRelationsDto | null> {
    const [acervo] = await this.buildBaseRelationsQuery()
      .where(eq(this.entityRef.id, id))
      .execute(session);
    return (acervo ?? null) as AcervoWithRelationsDto | null;
  }

  async getDetail(session: OrmSession, id: number): Promise<AcervoDetailDto | null> {
    const [acervo] = await this.buildDetailQuery()
      .where(eq(this.entityRef.id, id))
      .execute(session);
    return (acervo ?? null) as AcervoDetailDto | null;
  }
}
