import { TipoAcervo } from "../entities/TipoAcervo";
import type {
  CreateTipoAcervoDto,
  TipoAcervoDto,
  TipoAcervoQueryDto,
  ReplaceTipoAcervoDto,
  UpdateTipoAcervoDto
} from "../dtos/tipo-acervo/tipo-acervo.dtos";
import {
  TipoAcervoRepository,
  TIPO_ACERVO_FILTER_MAPPINGS
} from "../repositories/tipo-acervo.repository";
import { BaseService, type ListConfig } from "./base.service";

const SORTABLE_COLUMNS = ["id", "nome"] as const;

export class TipoAcervoService extends BaseService<
  TipoAcervo,
  TipoAcervoQueryDto,
  TipoAcervoDto,
  CreateTipoAcervoDto,
  ReplaceTipoAcervoDto,
  UpdateTipoAcervoDto
> {
  protected readonly repository: TipoAcervoRepository;
  protected readonly listConfig: ListConfig<TipoAcervo> = {
    filterMappings: TIPO_ACERVO_FILTER_MAPPINGS,
    sortableColumns: [...SORTABLE_COLUMNS],
    defaultSortBy: "id",
    defaultSortOrder: "ASC"
  };
  protected readonly entityName = "tipo acervo";

  constructor(repository?: TipoAcervoRepository) {
    super();
    this.repository = repository ?? new TipoAcervoRepository();
  }
}
