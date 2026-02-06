import { eq, isNotNull, selectFromEntity, type OrmSession } from "metal-orm";
import { Especializada } from "../entities/Especializada";
import type { EspecializadaWithResponsavelDto } from "../dtos/especializada/especializada.dtos";
import { BaseRepository, createFilterMappings } from "./base.repository";

export type EspecializadaFilterFields = "nome" | "sigla";
export type ResponsavelFilterFields = "nome";

export const ESPECIALIZADA_FILTER_MAPPINGS = createFilterMappings<Record<string, unknown>>({
  nomeContains: { field: "nome", operator: "contains" },
  siglaContains: { field: "sigla", operator: "contains" }
});

export const RESPONSAVEL_FILTER_MAPPINGS = createFilterMappings<Record<string, unknown>>({
  responsavelNomeContains: { field: "nome", operator: "contains" }
});

export class EspecializadaRepository extends BaseRepository<Especializada, EspecializadaWithResponsavelDto> {
  readonly entityClass = Especializada;

  override buildListQuery(): ReturnType<typeof selectFromEntity<Especializada>> {
    return selectFromEntity(Especializada)
      .include("responsavel", { columns: ["id", "nome"] });
  }

  async getWithResponsavel(session: OrmSession, id: number): Promise<Especializada | null> {
    const [especializada] = await selectFromEntity(Especializada)
      .include("responsavel", { columns: ["id", "nome"] })
      .where(eq(this.entityRef.id, id))
      .execute(session);
    return especializada ?? null;
  }

  override async getDetail(session: OrmSession, id: number): Promise<EspecializadaWithResponsavelDto | null> {
    return (await this.getWithResponsavel(session, id)) as EspecializadaWithResponsavelDto | null;
  }

  async listSiglas(session: OrmSession): Promise<string[]> {
    return selectFromEntity(Especializada)
      .distinct(this.entityRef.sigla)
      .where(isNotNull(this.entityRef.sigla))
      .orderBy(this.entityRef.sigla, "ASC")
      .pluck("sigla", session);
  }
}
