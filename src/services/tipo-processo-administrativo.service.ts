import { TipoProcessoAdministrativo } from "../entities/TipoProcessoAdministrativo";
import type {
  TipoProcessoAdministrativoQueryDto
} from "../dtos/tipo-processo-administrativo/tipo-processo-administrativo.dtos";
import {
  TipoProcessoAdministrativoRepository,
  TIPO_PROCESSO_ADMINISTRATIVO_FILTER_MAPPINGS
} from "../repositories/tipo-processo-administrativo.repository";
import { BaseService, type ListConfig } from "./base.service";

export class TipoProcessoAdministrativoService extends BaseService<
  TipoProcessoAdministrativo,
  TipoProcessoAdministrativoQueryDto
> {
  protected readonly repository: TipoProcessoAdministrativoRepository;
  protected readonly listConfig: ListConfig<TipoProcessoAdministrativo> = {
    filterMappings: TIPO_PROCESSO_ADMINISTRATIVO_FILTER_MAPPINGS,
    defaultSortBy: "nome",
    defaultSortOrder: "ASC"
  };

  protected readonly entityName = "tipo processo administrativo";

  constructor(repository?: TipoProcessoAdministrativoRepository) {
    super();
    this.repository = repository ?? new TipoProcessoAdministrativoRepository();
  }
}
