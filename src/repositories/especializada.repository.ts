import { entityRef, eq, isNotNull, selectFromEntity, type OrmSession } from "metal-orm";
import { Especializada } from "../entities/Especializada";

const E = entityRef(Especializada);

export type EspecializadaFilterFields = "nome" | "sigla";

export const ESPECIALIZADA_FILTER_MAPPINGS = {
  nomeContains: { field: "nome", operator: "contains" },
  siglaContains: { field: "sigla", operator: "contains" }
} satisfies Record<string, { field: EspecializadaFilterFields; operator: "equals" | "contains" }>;

export type ResponsavelFilterFields = "nome";

export const RESPONSAVEL_FILTER_MAPPINGS = {
  responsavelNomeContains: { field: "nome", operator: "contains" }
} satisfies Record<string, { field: ResponsavelFilterFields; operator: "equals" | "contains" }>;

export class EspecializadaRepository {
  readonly entityClass = Especializada;
  readonly entityRef: any = E;

  buildListQuery(): any {
    return selectFromEntity(Especializada)
      .includePick("responsavel", ["id", "nome"])
      .orderBy(this.entityRef.id, "ASC");
  }

  buildOptionsQuery(labelField = "nome"): any {
    const labelRef = (this.entityRef as any)[labelField];
    return (selectFromEntity(this.entityClass) as any)
      .select({ id: this.entityRef.id, nome: labelRef })
      .orderBy(labelRef, "ASC");
  }

  async getWithResponsavel(session: OrmSession, id: number): Promise<Especializada | null> {
    const [especializada] = await selectFromEntity(Especializada)
      .includePick("responsavel", ["id", "nome"])
      .where(eq(this.entityRef.id, id))
      .execute(session);
    return especializada ?? null;
  }

  async listSiglas(session: OrmSession): Promise<string[]> {
    return selectFromEntity(Especializada)
      .distinct(this.entityRef.sigla)
      .where(isNotNull(this.entityRef.sigla))
      .orderBy(this.entityRef.sigla, "ASC")
      .pluck("sigla", session);
  }

  async findById(session: OrmSession, id: number): Promise<Especializada | null> {
    return session.find(this.entityClass, id);
  }
}

