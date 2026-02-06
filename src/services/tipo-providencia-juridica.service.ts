import { TipoProvidenciaJuridica } from "../entities/TipoProvidenciaJuridica";
import type {
  TipoProvidenciaJuridicaQueryDto
} from "../dtos/tipo-providencia-juridica/tipo-providencia-juridica.dtos";
import {
  TipoProvidenciaJuridicaRepository,
  TIPO_PROVIDENCIA_JURIDICA_FILTER_MAPPINGS
} from "../repositories/tipo-providencia-juridica.repository";
import { BaseService, type ListConfig } from "./base.service";

export class TipoProvidenciaJuridicaService extends BaseService<
  TipoProvidenciaJuridica,
  TipoProvidenciaJuridicaQueryDto
> {
  protected readonly repository: TipoProvidenciaJuridicaRepository;
  protected readonly listConfig: ListConfig<TipoProvidenciaJuridica> = {
    filterMappings: TIPO_PROVIDENCIA_JURIDICA_FILTER_MAPPINGS,
    defaultSortBy: "nome",
    defaultSortOrder: "ASC"
  };

  protected readonly entityName = "tipo providência jurídica";

  constructor(repository?: TipoProvidenciaJuridicaRepository) {
    super();
    this.repository = repository ?? new TipoProvidenciaJuridicaRepository();
  }
}
