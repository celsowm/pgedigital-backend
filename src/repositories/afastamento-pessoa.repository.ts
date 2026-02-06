import { eq, selectFromEntity, type OrmSession } from "metal-orm";
import { AfastamentoPessoa } from "../entities/AfastamentoPessoa";
import {
  AFASTAMENTO_PESSOA_FILTER_MAPPINGS_SOURCE,
  type AfastamentoPessoaFilterFields,
  type AfastamentoPessoaDetailDto
} from "../dtos/afastamento-pessoa/afastamento-pessoa.dtos";
import { BaseRepository, createFilterMappings } from "./base.repository";

export const AFASTAMENTO_PESSOA_FILTER_MAPPINGS =
  createFilterMappings<Record<string, unknown>>(AFASTAMENTO_PESSOA_FILTER_MAPPINGS_SOURCE);

export class AfastamentoPessoaRepository extends BaseRepository<AfastamentoPessoa, AfastamentoPessoaDetailDto> {
  readonly entityClass = AfastamentoPessoa;

  override buildListQuery(): ReturnType<typeof selectFromEntity<AfastamentoPessoa>> {
    return selectFromEntity(AfastamentoPessoa)
      .include("usuario", {
        columns: ["id", "nome", "cargo", "vinculo", "especializada_id"],
        include: { especializada: { columns: ["id", "nome"] } }
      })
      .includePick("tipoAfastamento", ["id", "nome"])
      .includePick("tipoDivisaoCargaTrabalho", ["id", "nome"])
      .include("substitutos", {
        columns: ["id", "nome", "cargo", "vinculo", "especializada_id"],
        include: { especializada: { columns: ["id", "nome"] } },
        pivot: { columns: ["usa_equipe_acervo_substituto", "final_codigo_pa"], merge: true }
      });
  }

  buildDetailQuery(): ReturnType<typeof selectFromEntity<AfastamentoPessoa>> {
    return selectFromEntity(AfastamentoPessoa)
      .include("usuario", {
        columns: ["id", "nome", "cargo", "vinculo", "especializada_id"],
        include: { especializada: { columns: ["id", "nome"] } }
      })
      .includePick("tipoAfastamento", ["id", "nome"])
      .includePick("tipoDivisaoCargaTrabalho", ["id", "nome"])
      .includePick("filaCircular", ["id", "ultimo_elemento"])
      .include("substitutos", {
        columns: ["id", "nome", "cargo", "vinculo", "especializada_id"],
        include: { especializada: { columns: ["id", "nome"] } },
        pivot: { columns: ["usa_equipe_acervo_substituto", "final_codigo_pa"], merge: true }
      });
  }

  override async getDetail(session: OrmSession, id: number): Promise<AfastamentoPessoaDetailDto | null> {
    const [detail] = await this.buildDetailQuery()
      .where(eq(this.entityRef.id, id))
      .execute(session);
    return detail as AfastamentoPessoaDetailDto | null;
  }
}
