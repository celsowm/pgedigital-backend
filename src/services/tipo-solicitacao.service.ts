import { parseFilter, parsePagination } from "adorn-api";
import { applyFilter, toPagedResponse } from "metal-orm";
import { withSession } from "../db/mssql";
import { TipoSolicitacao } from "../entities/TipoSolicitacao";
import type {
  TipoSolicitacaoOptionDto,
  TipoSolicitacaoQueryDto
} from "../dtos/tipo-solicitacao/tipo-solicitacao.dtos";
import {
  TipoSolicitacaoRepository,
  TIPO_SOLICITACAO_FILTER_MAPPINGS,
  type TipoSolicitacaoFilterFields
} from "../repositories/tipo-solicitacao.repository";

export class TipoSolicitacaoService {
  private readonly repository: TipoSolicitacaoRepository;

  constructor(repository?: TipoSolicitacaoRepository) {
    this.repository = repository ?? new TipoSolicitacaoRepository();
  }

  async list(query: TipoSolicitacaoQueryDto): Promise<unknown> {
    const paginationQuery = (query ?? {}) as Record<string, unknown>;
    const { page, pageSize } = parsePagination(paginationQuery);
    const filters = parseFilter<TipoSolicitacao, TipoSolicitacaoFilterFields>(
      paginationQuery,
      TIPO_SOLICITACAO_FILTER_MAPPINGS
    );

    return withSession(async (session) => {
      const baseQuery = this.repository.buildListQuery();
      const filteredQuery = applyFilter(baseQuery, this.repository.entityClass, filters);
      const paged = await filteredQuery.executePaged(session, { page, pageSize });
      return toPagedResponse(paged);
    });
  }

  async listOptions(query: TipoSolicitacaoQueryDto): Promise<TipoSolicitacaoOptionDto[]> {
    const paginationQuery = (query ?? {}) as Record<string, unknown>;
    const filters = parseFilter<TipoSolicitacao, TipoSolicitacaoFilterFields>(
      paginationQuery,
      TIPO_SOLICITACAO_FILTER_MAPPINGS
    );

    return withSession(async (session) => {
      let optionsQuery = this.repository.buildOptionsQuery();
      if (filters) {
        optionsQuery = applyFilter(optionsQuery, this.repository.entityClass, filters);
      }
      return optionsQuery.executePlain(session);
    });
  }
}
