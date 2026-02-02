import { selectFromEntity } from "metal-orm";
import { AfastamentoPessoa } from "../entities/AfastamentoPessoa";
import { BaseRepository, createFilterMappings } from "./base.repository";

export type AfastamentoPessoaFilterFields =
  | "usuario_id"
  | "tipo_afastamento_id"
  | "tipo_divisao_carga_trabalho_id";

export const AFASTAMENTO_PESSOA_FILTER_MAPPINGS =
  createFilterMappings<AfastamentoPessoaFilterFields>({
    usuarioAfastadoId: { field: "usuario_id", operator: "equals" },
    tipoAfastamentoId: { field: "tipo_afastamento_id", operator: "equals" },
    tipoDivisaoCargaTrabalhoId: {
      field: "tipo_divisao_carga_trabalho_id",
      operator: "equals"
    }
  });

export class AfastamentoPessoaRepository extends BaseRepository<AfastamentoPessoa> {
  readonly entityClass = AfastamentoPessoa;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override buildListQuery(): any {
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
        pivot: { columns: ["usa_equipe_acervo_substituto", "final_codigo_pa"] }
      })
      .orderBy(this.entityRef.data_inicio, "DESC")
      .orderBy(this.entityRef.id, "ASC");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  buildDetailQuery(): any {
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
        pivot: { columns: ["usa_equipe_acervo_substituto", "final_codigo_pa"] }
      });
  }
}
