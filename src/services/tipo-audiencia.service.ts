import { parseFilter, parsePagination } from "adorn-api";
import { applyFilter, toPagedResponse } from "metal-orm";
import { withSession } from "../db/mssql";
import { TipoAudiencia } from "../entities/TipoAudiencia";
import type {
  TipoAudienciaOptionDto,
  TipoAudienciaQueryDto
} from "../dtos/tipo-audiencia/tipo-audiencia.dtos";
import {
  TipoAudienciaRepository,
  TIPO_AUDIENCIA_FILTER_MAPPINGS,
  type TipoAudienciaFilterFields
} from "../repositories/tipo-audiencia.repository";

export class TipoAudienciaService {
  private readonly repository: TipoAudienciaRepository;

  constructor(repository?: TipoAudienciaRepository) {
    this.repository = repository ?? new TipoAudienciaRepository();
  }

  async list(query: TipoAudienciaQueryDto): Promise<unknown> {
    const paginationQuery = (query ?? {}) as Record<string, unknown>;
    const { page, pageSize } = parsePagination(paginationQuery);
    const filters = parseFilter<TipoAudiencia, TipoAudienciaFilterFields>(
      paginationQuery,
      TIPO_AUDIENCIA_FILTER_MAPPINGS
    );

    return withSession(async (session) => {
      const baseQuery = this.repository.buildListQuery();
      const filteredQuery = applyFilter(baseQuery, this.repository.entityClass, filters);
      const paged = await filteredQuery.executePaged(session, { page, pageSize });
      return toPagedResponse(paged);
    });
  }

  async listOptions(query: TipoAudienciaQueryDto): Promise<TipoAudienciaOptionDto[]> {
    const paginationQuery = (query ?? {}) as Record<string, unknown>;
    const filters = parseFilter<TipoAudiencia, TipoAudienciaFilterFields>(
      paginationQuery,
      TIPO_AUDIENCIA_FILTER_MAPPINGS
    );

    return withSession(async (session) => {
      let optionsQuery = this.repository.buildOptionsQuery("descricao");
      if (filters) {
        optionsQuery = applyFilter(optionsQuery, this.repository.entityClass, filters);
      }
      return optionsQuery.executePlain(session) as Promise<TipoAudienciaOptionDto[]>;
    });
  }
}
