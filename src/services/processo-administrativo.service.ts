import { ProcessoAdministrativo } from "../entities/ProcessoAdministrativo";
import type {
  ProcessoAdministrativoDto,
  ProcessoAdministrativoQueryDto
} from "../dtos/processo-administrativo/processo-administrativo.dtos";
import {
  ProcessoAdministrativoRepository,
  PROCESSO_ADMINISTRATIVO_FILTER_MAPPINGS
} from "../repositories/processo-administrativo.repository";
import { BaseService, type ListConfig } from "./base.service";

const SORTABLE_COLUMNS = ["id", "codigo_pa", "data_criacao"] as const;

export class ProcessoAdministrativoService extends BaseService<
  ProcessoAdministrativo,
  ProcessoAdministrativoQueryDto,
  ProcessoAdministrativoDto,
  null,
  null,
  null
> {
  protected readonly repository: ProcessoAdministrativoRepository;
  protected readonly listConfig: ListConfig<ProcessoAdministrativo> = {
    filterMappings: PROCESSO_ADMINISTRATIVO_FILTER_MAPPINGS,
    sortableColumns: [...SORTABLE_COLUMNS],
    defaultSortBy: "id",
    defaultSortOrder: "ASC"
  };
  protected readonly entityName = "processo administrativo";

  constructor(repository?: ProcessoAdministrativoRepository) {
    super();
    this.repository = repository ?? new ProcessoAdministrativoRepository();
  }
}
