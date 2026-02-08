import { eq, selectFromEntity, type OrmSession } from "metal-orm";
import { Carga } from "../entities/Carga";
import type { CaixaEntradaDto } from "../dtos/caixa-entrada/caixa-entrada.dtos";
import { BaseRepository, createFilterMappings } from "./base.repository";

export type CaixaEntradaFilterFields =
  | "usuarioId"
  | "lido"
  | "pastaId"
  | "tipoProcessoAdministrativoId"
  | "tipoEntrada"
  | "classificacaoId"
  | "temaPrincipalId"
  | "substituicao"
  | "acervoId"
  | "especializadaId"
  | "urgenciaId"
  | "numeroJudicialContains"
  | "numeroPaContains"
  | "autorContains"
  | "reuContains"
  | "interessadoContains"
  | "dataInicioGte"
  | "dataFimLte"
  | "origemDemanda"
  | "comPrazo"
  | "comPrazoDefinido";

export const CAIXA_ENTRADA_FILTER_MAPPINGS = createFilterMappings<Record<string, unknown>>({
  usuarioId: { field: "usuario_id", operator: "equals" },
  lido: { field: "lido", operator: "equals" },
  pastaId: { field: "pasta_id", operator: "equals" },
  tipoProcessoAdministrativoId: { field: "processoAdministrativo.some.tipo_processo_administrativo_id", operator: "equals" },
  tipoEntrada: { field: "registroTramitacao.some.tramitacao.some.codigo", operator: "equals" },
  classificacaoId: { field: "processoAdministrativo.some.classificacao_id", operator: "equals" },
  temaPrincipalId: { field: "processoAdministrativo.some.tema_principal_id", operator: "equals" },
  substituicao: { field: "registroTramitacao.some.substituicao", operator: "equals" },
  acervoId: { field: "processoAdministrativo.some.acervo_id", operator: "equals" },
  especializadaId: { field: "processoAdministrativo.some.especializada_id", operator: "equals" },
  urgenciaId: { field: "processoAdministrativo.some.urgencia_id", operator: "equals" },
  numeroJudicialContains: { field: "processoAdministrativo.some.processoJudicial.some.numero", operator: "contains" },
  numeroPaContains: { field: "processoAdministrativo.some.codigo_pa", operator: "contains" },
  autorContains: { field: "processoAdministrativo.some.processoJudicial.some.partes.some.pessoa.some.nome", operator: "contains" },
  reuContains: { field: "processoAdministrativo.some.processoJudicial.some.partes.some.pessoa.some.nome", operator: "contains" },
  interessadoContains: { field: "processoAdministrativo.some.interessados.some.pessoa.some.nome", operator: "contains" },
  dataInicioGte: { field: "registroTramitacao.some.data_hora_tramitacao", operator: "gte" },
  dataFimLte: { field: "registroTramitacao.some.data_hora_tramitacao", operator: "lte" },
  origemDemanda: { field: "processoAdministrativo.some.comunicacoes.some.tipo_comunicacao_id", operator: "equals" },
  comPrazo: { field: "processoAdministrativo.some.comunicacoes.some.prazo", operator: "equals" },
  comPrazoDefinido: { field: "processoAdministrativo.some.providenciasJuridicas.some.prazo", operator: "equals" }
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
          classificacao: {
            columns: ["id"],
            include: {
              classificacaoRelevancia: { columns: ["id", "nome"] },
              classificacaoRecorrencia: { columns: ["id", "nome"] }
            }
          },
          especializada: { columns: ["id", "nome", "sigla"] },
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