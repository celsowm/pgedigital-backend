import { parseFilter } from "adorn-api";
import { applyFilter } from "metal-orm";
import { withSession } from "../db/mssql";
import { TipoProcessoAdministrativo } from "../entities/TipoProcessoAdministrativo";
import type {
  TipoProcessoAdministrativoOptionDto,
  TipoProcessoAdministrativoQueryDto
} from "../dtos/tipo-processo-administrativo/tipo-processo-administrativo.dtos";
import {
  TipoProcessoAdministrativoRepository,
  TIPO_PROCESSO_ADMINISTRATIVO_FILTER_MAPPINGS,
  type TipoProcessoAdministrativoFilterFields
} from "../repositories/tipo-processo-administrativo.repository";

export class TipoProcessoAdministrativoService {
  private readonly repository: TipoProcessoAdministrativoRepository;

  constructor(repository?: TipoProcessoAdministrativoRepository) {
    this.repository = repository ?? new TipoProcessoAdministrativoRepository();
  }

  async listOptions(
    query: TipoProcessoAdministrativoQueryDto
  ): Promise<TipoProcessoAdministrativoOptionDto[]> {
    const paginationQuery = (query ?? {}) as Record<string, unknown>;
    const filters = parseFilter<TipoProcessoAdministrativo, TipoProcessoAdministrativoFilterFields>(
      paginationQuery,
      TIPO_PROCESSO_ADMINISTRATIVO_FILTER_MAPPINGS
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
