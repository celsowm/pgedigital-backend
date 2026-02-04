import type {
  TipoSolicitacaoQueryDto
} from "../dtos/tipo-solicitacao/tipo-solicitacao.dtos";
import {
  TipoSolicitacaoRepository,
  TIPO_SOLICITACAO_FILTER_MAPPINGS,
  type TipoSolicitacaoFilterFields
} from "../repositories/tipo-solicitacao.repository";
import { BaseService, type ListConfig } from "./base.service";
import type { TipoSolicitacao } from "../entities/TipoSolicitacao";

const SORTABLE_COLUMNS = ["id", "nome"] as const;

export class TipoSolicitacaoService extends BaseService<TipoSolicitacao, TipoSolicitacaoFilterFields, TipoSolicitacaoQueryDto> {
  protected readonly repository: TipoSolicitacaoRepository;
  protected readonly listConfig: ListConfig<TipoSolicitacao, TipoSolicitacaoFilterFields> = {
    filterMappings: TIPO_SOLICITACAO_FILTER_MAPPINGS,
    sortableColumns: [...SORTABLE_COLUMNS],
    defaultSortBy: "id",
    defaultSortOrder: "ASC"
  };

  constructor(repository?: TipoSolicitacaoRepository) {
    super();
    this.repository = repository ?? new TipoSolicitacaoRepository();
  }
}
