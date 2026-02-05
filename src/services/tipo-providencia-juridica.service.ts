import { parseFilter } from "adorn-api";
import { applyFilter, type WhereInput } from "metal-orm";
import { withSession } from "../db/mssql";
import { TipoProvidenciaJuridica } from "../entities/TipoProvidenciaJuridica";
import type {
  TipoProvidenciaJuridicaOptionDto,
  TipoProvidenciaJuridicaQueryDto
} from "../dtos/tipo-providencia-juridica/tipo-providencia-juridica.dtos";
import {
  TipoProvidenciaJuridicaRepository,
  TIPO_PROVIDENCIA_JURIDICA_FILTER_MAPPINGS,
  type TipoProvidenciaJuridicaFilterFields
} from "../repositories/tipo-providencia-juridica.repository";

export class TipoProvidenciaJuridicaService {
  private readonly repository: TipoProvidenciaJuridicaRepository;

  constructor(repository?: TipoProvidenciaJuridicaRepository) {
    this.repository = repository ?? new TipoProvidenciaJuridicaRepository();
  }

  async listOptions(
    query: TipoProvidenciaJuridicaQueryDto
  ): Promise<TipoProvidenciaJuridicaOptionDto[]> {
    const paginationQuery = (query ?? {}) as Record<string, unknown>;
    const filters = parseFilter<TipoProvidenciaJuridica, TipoProvidenciaJuridicaFilterFields>(
      paginationQuery,
      TIPO_PROVIDENCIA_JURIDICA_FILTER_MAPPINGS
    );

    return withSession(async (session) => {
      let optionsQuery = this.repository.buildOptionsQuery();
      if (filters) {
        optionsQuery = applyFilter(
          optionsQuery,
          this.repository.entityClass,
          filters as WhereInput<typeof this.repository.entityClass>
        );
      }
      return optionsQuery.executePlain(session);
    });
  }
}
