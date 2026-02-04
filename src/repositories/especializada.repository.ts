import { eq, isNotNull, selectFromEntity, type OrmSession } from "metal-orm";
import { Especializada } from "../entities/Especializada";
import { BaseRepository, createFilterMappings } from "./base.repository";

export type EspecializadaFilterFields = "nome" | "sigla";

export const ESPECIALIZADA_FILTER_MAPPINGS = createFilterMappings<EspecializadaFilterFields>({
  nomeContains: { field: "nome", operator: "contains" },
  siglaContains: { field: "sigla", operator: "contains" }
});

export type ResponsavelFilterFields = "nome";

export const RESPONSAVEL_FILTER_MAPPINGS = createFilterMappings<ResponsavelFilterFields>({
  responsavelNomeContains: { field: "nome", operator: "contains" }
});

export class EspecializadaRepository extends BaseRepository<Especializada> {
  readonly entityClass = Especializada;

  override buildListQuery(): ReturnType<typeof selectFromEntity<Especializada>> {
    return selectFromEntity(Especializada)
      .include("responsavel", { columns: ["id", "nome"], include: { usuarioThumbnail: { columns: ["id", "thumbnail"] } } });
  }

  async getWithResponsavel(session: OrmSession, id: number): Promise<Especializada | null> {
    const [especializada] = await selectFromEntity(Especializada)
      .include("responsavel", { columns: ["id", "nome"], include: { usuarioThumbnail: { columns: ["id", "thumbnail"] } } })
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
}
