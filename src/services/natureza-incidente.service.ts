import { NaturezaIncidente } from "../entities/NaturezaIncidente";
import type {
  CreateNaturezaIncidenteDto,
  NaturezaIncidenteDto,
  NaturezaIncidenteQueryDto,
  ReplaceNaturezaIncidenteDto,
  UpdateNaturezaIncidenteDto
} from "../dtos/natureza-incidente/natureza-incidente.dtos";
import {
  NaturezaIncidenteRepository,
  NATUREZA_INCIDENTE_FILTER_MAPPINGS
} from "../repositories/natureza-incidente.repository";
import { BaseService, type ListConfig } from "./base.service";

const SORTABLE_COLUMNS = ["id", "nome"] as const;

export class NaturezaIncidenteService extends BaseService<
  NaturezaIncidente,
  NaturezaIncidenteQueryDto,
  NaturezaIncidenteDto,
  CreateNaturezaIncidenteDto,
  ReplaceNaturezaIncidenteDto,
  UpdateNaturezaIncidenteDto
> {
  protected readonly repository: NaturezaIncidenteRepository;
  protected readonly listConfig: ListConfig<NaturezaIncidente> = {
    filterMappings: NATUREZA_INCIDENTE_FILTER_MAPPINGS,
    sortableColumns: [...SORTABLE_COLUMNS],
    defaultSortBy: "id",
    defaultSortOrder: "ASC"
  };
  protected readonly entityName = "natureza incidente";

  constructor(repository?: NaturezaIncidenteRepository) {
    super();
    this.repository = repository ?? new NaturezaIncidenteRepository();
  }
}
