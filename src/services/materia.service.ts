import { Materia } from "../entities/Materia";
import type {
  CreateMateriaDto,
  MateriaDto,
  MateriaQueryDto,
  ReplaceMateriaDto,
  UpdateMateriaDto
} from "../dtos/materia/materia.dtos";
import {
  MateriaRepository,
  MATERIA_FILTER_MAPPINGS
} from "../repositories/materia.repository";
import { BaseService, type ListConfig } from "./base.service";

const SORTABLE_COLUMNS = ["id", "nome"] as const;

export class MateriaService extends BaseService<
  Materia,
  MateriaQueryDto,
  MateriaDto,
  CreateMateriaDto,
  ReplaceMateriaDto,
  UpdateMateriaDto
> {
  protected readonly repository: MateriaRepository;
  protected readonly listConfig: ListConfig<Materia> = {
    filterMappings: MATERIA_FILTER_MAPPINGS,
    sortableColumns: [...SORTABLE_COLUMNS],
    defaultSortBy: "id",
    defaultSortOrder: "ASC"
  };
  protected readonly entityName = "matéria";

  constructor(repository?: MateriaRepository) {
    super();
    this.repository = repository ?? new MateriaRepository();
  }
}
