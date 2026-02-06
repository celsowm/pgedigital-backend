import { TipoAudiencia } from "../entities/TipoAudiencia";
import type {
  TipoAudienciaOptionDto,
  TipoAudienciaQueryDto
} from "../dtos/tipo-audiencia/tipo-audiencia.dtos";
import {
  TipoAudienciaRepository,
  TIPO_AUDIENCIA_FILTER_MAPPINGS
} from "../repositories/tipo-audiencia.repository";
import { BaseService, type ListConfig } from "./base.service";

const SORTABLE_COLUMNS = ["id", "descricao"] as const;

export class TipoAudienciaService extends BaseService<
  TipoAudiencia,
  TipoAudienciaQueryDto,
  TipoAudiencia
> {
  protected readonly repository: TipoAudienciaRepository;
  protected readonly listConfig: ListConfig<TipoAudiencia> = {
    filterMappings: TIPO_AUDIENCIA_FILTER_MAPPINGS,
    sortableColumns: [...SORTABLE_COLUMNS],
    defaultSortBy: "id",
    defaultSortOrder: "ASC"
  };

  protected readonly entityName = "tipo audiência";

  constructor(repository?: TipoAudienciaRepository) {
    super();
    this.repository = repository ?? new TipoAudienciaRepository();
  }

  override async listOptions(query: TipoAudienciaQueryDto): Promise<TipoAudienciaOptionDto[]> {
    return super.listOptions(query, "descricao") as unknown as Promise<TipoAudienciaOptionDto[]>;
  }
}
