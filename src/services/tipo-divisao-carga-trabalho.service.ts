import { parseFilter } from "adorn-api";
import { applyFilter } from "metal-orm";
import { withSession } from "../db/mssql";
import { TipoDivisaoCargaTrabalho } from "../entities/TipoDivisaoCargaTrabalho";
import type {
  TipoDivisaoCargaTrabalhoOptionDto,
  TipoDivisaoCargaTrabalhoQueryDto
} from "../dtos/tipo-divisao-carga-trabalho/tipo-divisao-carga-trabalho.dtos";
import {
  TipoDivisaoCargaTrabalhoRepository,
  TIPO_DIVISAO_CARGA_TRABALHO_FILTER_MAPPINGS,
  type TipoDivisaoCargaTrabalhoFilterFields
} from "../repositories/tipo-divisao-carga-trabalho.repository";

export class TipoDivisaoCargaTrabalhoService {
  private readonly repository: TipoDivisaoCargaTrabalhoRepository;

  constructor(repository?: TipoDivisaoCargaTrabalhoRepository) {
    this.repository = repository ?? new TipoDivisaoCargaTrabalhoRepository();
  }

  async listOptions(
    query: TipoDivisaoCargaTrabalhoQueryDto
  ): Promise<TipoDivisaoCargaTrabalhoOptionDto[]> {
    const paginationQuery = (query ?? {}) as Record<string, unknown>;
    const filters = parseFilter<TipoDivisaoCargaTrabalho, TipoDivisaoCargaTrabalhoFilterFields>(
      paginationQuery,
      TIPO_DIVISAO_CARGA_TRABALHO_FILTER_MAPPINGS
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
