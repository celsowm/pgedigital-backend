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
  tipoProcessoAdministrativoId: { field: "processoAdministrativo.tipo_processo_administrativo_id", operator: "equals" },
  tipoEntrada: { field: "registroTramitacao.tramitacao.codigo", operator: "equals" },
  classificacaoId: { field: "processoAdministrativo.classificacao_id", operator: "equals" },
  temaPrincipalId: { field: "processoAdministrativo.tema_principal_id", operator: "equals" },
  substituicao: { field: "registroTramitacao.substituicao", operator: "equals" },
  acervoId: { field: "processoAdministrativo.acervo_id", operator: "equals" },
  especializadaId: { field: "processoAdministrativo.especializada_id", operator: "equals" },
  urgenciaId: { field: "processoAdministrativo.urgencia_id", operator: "equals" },
  numeroJudicialContains: { field: "processoAdministrativo.processoJudicial.numero", operator: "contains" },
  numeroPaContains: { field: "processoAdministrativo.codigo_pa", operator: "contains" },
  autorContains: { field: "processoAdministrativo.processoJudicial.partes.some.pessoa.nome", operator: "contains" },
  reuContains: { field: "processoAdministrativo.processoJudicial.partes.some.pessoa.nome", operator: "contains" },
  interessadoContains: { field: "processoAdministrativo.interessados.some.pessoa.nome", operator: "contains" },
  dataInicioGte: { field: "registroTramitacao.data_hora_tramitacao", operator: "gte" },
  dataFimLte: { field: "registroTramitacao.data_hora_tramitacao", operator: "lte" },
  origemDemanda: { field: "processoAdministrativo.comunicacoes.some.tipo_comunicacao_id", operator: "equals" },
  comPrazo: { field: "processoAdministrativo.comunicacoes.some.prazo", operator: "equals" },
  comPrazoDefinido: { field: "processoAdministrativo.providenciasJuridicas.some.prazo", operator: "equals" }
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