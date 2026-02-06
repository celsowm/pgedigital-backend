import { Equipe } from "../entities/Equipe";
import type {
  CreateEquipeDto,
  EquipeQueryDto,
  EquipeWithEspecializadaDto,
  ReplaceEquipeDto,
  UpdateEquipeDto
} from "../dtos/equipe/equipe.dtos";
import {
  EquipeRepository,
  EQUIPE_FILTER_MAPPINGS
} from "../repositories/equipe.repository";
import { BaseService, type ListConfig } from "./base.service";

const SORTABLE_COLUMNS = ["id", "nome", "especializada_id"] as const;

export class EquipeService extends BaseService<
  Equipe,
  EquipeQueryDto,
  EquipeWithEspecializadaDto,
  CreateEquipeDto,
  ReplaceEquipeDto,
  UpdateEquipeDto
> {
  protected readonly repository: EquipeRepository;
  protected readonly listConfig: ListConfig<Equipe> = {
    filterMappings: EQUIPE_FILTER_MAPPINGS,
    sortableColumns: [...SORTABLE_COLUMNS],
    defaultSortBy: "id",
    defaultSortOrder: "ASC"
  };
  protected readonly entityName = "equipe";

  constructor(repository?: EquipeRepository) {
    super();
    this.repository = repository ?? new EquipeRepository();
  }
}
