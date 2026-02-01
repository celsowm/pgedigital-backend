import { entityRef, eq, selectFromEntity, type OrmSession } from "metal-orm";
import { Acervo } from "../entities/Acervo";
import type { AcervoDetailDto, AcervoWithRelationsDto } from "../dtos/acervo/acervo.dtos";

const A = entityRef(Acervo);

export type AcervoFilterFields = "nome" | "especializada_id" | "tipo_acervo_id" | "ativo";

export const ACERVO_FILTER_MAPPINGS = {
  nomeContains: { field: "nome", operator: "contains" },
  especializadaId: { field: "especializada_id", operator: "equals" },
  tipoAcervoId: { field: "tipo_acervo_id", operator: "equals" },
  ativo: { field: "ativo", operator: "equals" }
} satisfies Record<string, { field: AcervoFilterFields; operator: "equals" | "contains" }>;

export class AcervoRepository {
  readonly entityClass = Acervo;
  readonly entityRef: any = A;

  buildListQuery(): any {
    return selectFromEntity(Acervo)
      .includePick("especializada", ["id", "nome"])
      .includePick("procuradorTitular", ["id", "nome"])
      .includePick("tipoAcervo", ["id", "nome"])
      .orderBy(A.id, "ASC");
  }

  buildOptionsQuery(labelField = "nome"): any {
    const labelRef = (this.entityRef as any)[labelField];
    return (selectFromEntity(this.entityClass) as any)
      .select({ id: this.entityRef.id, nome: labelRef })
      .orderBy(labelRef, "ASC");
  }

  buildBaseRelationsQuery(): any {
    return selectFromEntity(Acervo)
      .includePick("especializada", ["id", "nome"])
      .includePick("procuradorTitular", ["id", "nome"])
      .includePick("tipoAcervo", ["id", "nome"])
      .includePick("tipoMigracaoAcervo", ["id", "nome"])
      .includePick("equipeResponsavel", ["id", "nome"])
      .includePick("tipoDivisaoCargaTrabalho", ["id", "nome"]);
  }

  buildDetailQuery(): any {
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

  async getDetail(session: OrmSession, id: number): Promise<AcervoDetailDto | null> {
    const [acervo] = await this.buildDetailQuery()
      .where(eq(this.entityRef.id, id))
      .execute(session);
    return (acervo ?? null) as AcervoDetailDto | null;
  }

  async findById(session: OrmSession, id: number): Promise<Acervo | null> {
    return session.find(this.entityClass, id);
  }
}

