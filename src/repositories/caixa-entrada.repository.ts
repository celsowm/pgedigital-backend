import { eq, selectFromEntity, type OrmSession } from "metal-orm";
import { Carga } from "../entities/Carga";
import type { CaixaEntradaDto } from "../dtos/caixa-entrada/caixa-entrada.dtos";
import { BaseRepository, createFilterMappings } from "./base.repository";

export type CaixaEntradaFilterFields = "usuarioId" | "lido" | "pastaId";

export const CAIXA_ENTRADA_FILTER_MAPPINGS = createFilterMappings<Record<string, unknown>>({
  usuarioId: { field: "usuario_id", operator: "equals" },
  lido: { field: "lido", operator: "equals" },
  pastaId: { field: "pasta_id", operator: "equals" }
});

export class CaixaEntradaRepository extends BaseRepository<Carga, CaixaEntradaDto> {
  readonly entityClass = Carga;

  override buildListQuery(): ReturnType<typeof selectFromEntity<Carga>> {
    return selectFromEntity(Carga)
      .include("registroTramitacao", {
        columns: ["id", "data_hora_tramitacao", "substituicao"],
        include: {
          tramitacao: { columns: ["id", "nome", "codigo"] },
          remetente: { columns: ["id", "nome"] }
        }
      })
      .include("processoAdministrativo", {
        columns: ["id", "codigo_pa", "especializada_id", "acervo_id", "classificacao_id", "processo_judicial_id", "valor_causa"],
        include: {
          classificacao: { columns: ["id", "nome"] },
          especializada: { columns: ["id", "nome"] },
          acervo: { columns: ["id", "nome"] },
          processoJudicial: {
            columns: ["id", "numero"],
            include: {
              partes: {
                columns: ["id", "tipo_polo_id"],
                include: {
                  pessoa: { columns: ["id", "nome"] }
                }
              }
            }
          },
          comunicacoes: {
            columns: ["id", "data_recebimento", "prazo", "tipo_comunicacao_id"]
          },
          providenciasJuridicas: {
            columns: ["id", "prazo", "comunicacao_id", "estado_id"],
            include: {
              estado: { columns: ["id", "nome"] }
            }
          }
        }
      });
  }

  override async getDetail(session: OrmSession, id: number): Promise<CaixaEntradaDto | null> {
    const [carga] = await this.buildListQuery()
      .where(eq(this.entityRef.id, id))
      .execute(session);
    return carga as CaixaEntradaDto | null;
  }
}