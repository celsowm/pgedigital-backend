import { selectFromEntity } from "metal-orm";
import { AfastamentoPessoa } from "../entities/AfastamentoPessoa";
import {
  AFASTAMENTO_PESSOA_FILTER_MAPPINGS_SOURCE,
  type AfastamentoPessoaFilterFields
} from "../dtos/afastamento-pessoa/afastamento-pessoa.dtos";
import { BaseRepository, createFilterMappings } from "./base.repository";

export const AFASTAMENTO_PESSOA_FILTER_MAPPINGS =
  createFilterMappings<AfastamentoPessoaFilterFields>(AFASTAMENTO_PESSOA_FILTER_MAPPINGS_SOURCE);

export class AfastamentoPessoaRepository extends BaseRepository<AfastamentoPessoa> {
  readonly entityClass = AfastamentoPessoa;

  override buildListQuery(): ReturnType<typeof selectFromEntity<AfastamentoPessoa>> {
    return selectFromEntity(AfastamentoPessoa)
      .include("usuario", {
        columns: ["id", "nome", "cargo", "vinculo", "especializada_id"],
        include: { especializada: { columns: ["id", "nome"] }, usuarioThumbnail: { columns: ["id", "thumbnail"] } }
      })
      .includePick("tipoAfastamento", ["id", "nome"])
      .includePick("tipoDivisaoCargaTrabalho", ["id", "nome"])
      .include("substitutos", {
        columns: ["id", "nome", "cargo", "vinculo", "especializada_id"],
        include: { especializada: { columns: ["id", "nome"] }, usuarioThumbnail: { columns: ["id", "thumbnail"] } },
        pivot: { columns: ["usa_equipe_acervo_substituto", "final_codigo_pa"], merge: true }
      })
      .orderBy(this.entityRef.data_inicio, "DESC")
      .orderBy(this.entityRef.id, "ASC");
  }

  buildDetailQuery(): ReturnType<typeof selectFromEntity<AfastamentoPessoa>> {
    return selectFromEntity(AfastamentoPessoa)
      .include("usuario", {
        columns: ["id", "nome", "cargo", "vinculo", "especializada_id"],
        include: { especializada: { columns: ["id", "nome"] }, usuarioThumbnail: { columns: ["id", "thumbnail"] } }
      })
      .includePick("tipoAfastamento", ["id", "nome"])
      .includePick("tipoDivisaoCargaTrabalho", ["id", "nome"])
      .includePick("filaCircular", ["id", "ultimo_elemento"])
      .include("substitutos", {
        columns: ["id", "nome", "cargo", "vinculo", "especializada_id"],
        include: { especializada: { columns: ["id", "nome"] }, usuarioThumbnail: { columns: ["id", "thumbnail"] } },
        pivot: { columns: ["usa_equipe_acervo_substituto", "final_codigo_pa"], merge: true }
      });
  }
}
