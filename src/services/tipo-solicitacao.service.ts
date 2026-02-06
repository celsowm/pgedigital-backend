import { TipoSolicitacao } from "../entities/TipoSolicitacao";
import type { TipoSolicitacaoQueryDto } from "../dtos/tipo-solicitacao/tipo-solicitacao.dtos";
import {
  TipoSolicitacaoRepository,
  TIPO_SOLICITACAO_FILTER_MAPPINGS
} from "../repositories/tipo-solicitacao.repository";
import { BaseService, type ListConfig } from "./base.service";

const SORTABLE_COLUMNS = ["id", "nome"] as const;

export class TipoSolicitacaoService extends BaseService<TipoSolicitacao, TipoSolicitacaoQueryDto> {
  protected readonly repository: TipoSolicitacaoRepository;
  protected readonly listConfig: ListConfig<TipoSolicitacao> = {
    filterMappings: TIPO_SOLICITACAO_FILTER_MAPPINGS,
    sortableColumns: [...SORTABLE_COLUMNS],
    defaultSortBy: "id",
    defaultSortOrder: "ASC"
  };

  protected readonly entityName = "tipo solicitação";

  constructor(repository?: TipoSolicitacaoRepository) {
    super();
    this.repository = repository ?? new TipoSolicitacaoRepository();
  }
}
