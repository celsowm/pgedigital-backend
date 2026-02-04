import type {
  TipoAudienciaOptionDto,
  TipoAudienciaQueryDto
} from "../dtos/tipo-audiencia/tipo-audiencia.dtos";
import {
  TipoAudienciaRepository,
  TIPO_AUDIENCIA_FILTER_MAPPINGS,
  type TipoAudienciaFilterFields
} from "../repositories/tipo-audiencia.repository";
import { BaseService, type ListConfig } from "./base.service";
import type { TipoAudiencia } from "../entities/TipoAudiencia";

const SORTABLE_COLUMNS = ["id", "descricao"] as const;

export class TipoAudienciaService extends BaseService<TipoAudiencia, TipoAudienciaFilterFields, TipoAudienciaQueryDto> {
  protected readonly repository: TipoAudienciaRepository;
  protected readonly listConfig: ListConfig<TipoAudiencia, TipoAudienciaFilterFields> = {
    filterMappings: TIPO_AUDIENCIA_FILTER_MAPPINGS,
    sortableColumns: [...SORTABLE_COLUMNS],
    defaultSortBy: "id",
    defaultSortOrder: "ASC"
  };

  constructor(repository?: TipoAudienciaRepository) {
    super();
    this.repository = repository ?? new TipoAudienciaRepository();
  }

  override async listOptions(query: TipoAudienciaQueryDto): Promise<TipoAudienciaOptionDto[]> {
    return super.listOptions(query, "descricao");
  }
}
