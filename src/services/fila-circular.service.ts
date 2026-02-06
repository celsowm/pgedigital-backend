import { FilaCircular } from "../entities/FilaCircular";
import type {
  CreateFilaCircularDto,
  FilaCircularDto,
  FilaCircularOptionDto,
  FilaCircularQueryDto,
  ReplaceFilaCircularDto,
  UpdateFilaCircularDto
} from "../dtos/fila-circular/fila-circular.dtos";
import {
  FilaCircularRepository,
  FILA_CIRCULAR_FILTER_MAPPINGS
} from "../repositories/fila-circular.repository";
import { BaseService, type ListConfig } from "./base.service";

const SORTABLE_COLUMNS = ["id", "ultimo_elemento"] as const;

export class FilaCircularService extends BaseService<
  FilaCircular,
  FilaCircularQueryDto,
  FilaCircularDto,
  CreateFilaCircularDto,
  ReplaceFilaCircularDto,
  UpdateFilaCircularDto
> {
  protected readonly repository: FilaCircularRepository;
  protected readonly listConfig: ListConfig<FilaCircular> = {
    filterMappings: FILA_CIRCULAR_FILTER_MAPPINGS,
    sortableColumns: [...SORTABLE_COLUMNS],
    defaultSortBy: "id",
    defaultSortOrder: "ASC"
  };
  protected readonly entityName = "fila circular";

  constructor(repository?: FilaCircularRepository) {
    super();
    this.repository = repository ?? new FilaCircularRepository();
  }

  override async listOptions(query: FilaCircularQueryDto): Promise<FilaCircularOptionDto[]> {
    return super.listOptions(query, "ultimo_elemento") as unknown as Promise<FilaCircularOptionDto[]>;
  }
}
