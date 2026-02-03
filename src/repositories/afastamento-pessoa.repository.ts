import { selectFromEntity } from "metal-orm";
import { AfastamentoPessoa } from "../entities/AfastamentoPessoa";
import {
  AFASTAMENTO_PESSOA_FILTER_DEFS,
  type AfastamentoPessoaFilterFields
} from "../dtos/afastamento-pessoa/afastamento-pessoa.dtos";
import { BaseRepository, createFilterMappings } from "./base.repository";

type FilterMappingDef = { entityField: AfastamentoPessoaFilterFields; operator: "equals" | "contains" };

const hasEntityField = (def: unknown): def is FilterMappingDef =>
  typeof def === "object" && def !== null && "entityField" in def;

const AFASTAMENTO_PESSOA_FILTER_MAPPINGS_SOURCE = Object.entries(AFASTAMENTO_PESSOA_FILTER_DEFS)
  .reduce<Record<string, { field: AfastamentoPessoaFilterFields; operator: "equals" | "contains" }>>(
    (acc, [key, def]) => {
      if (hasEntityField(def)) {
        acc[key] = { field: def.entityField, operator: def.operator };
      }
      return acc;
    },
    {}
  );

export const AFASTAMENTO_PESSOA_FILTER_MAPPINGS =
  createFilterMappings<AfastamentoPessoaFilterFields>(AFASTAMENTO_PESSOA_FILTER_MAPPINGS_SOURCE);

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
