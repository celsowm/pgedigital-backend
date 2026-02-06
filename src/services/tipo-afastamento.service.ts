import { TipoAfastamento } from "../entities/TipoAfastamento";
import type {
  CreateTipoAfastamentoDto,
  TipoAfastamentoDto,
  TipoAfastamentoQueryDto,
  ReplaceTipoAfastamentoDto,
  UpdateTipoAfastamentoDto
} from "../dtos/tipo-afastamento/tipo-afastamento.dtos";
import {
  TipoAfastamentoRepository,
  TIPO_AFASTAMENTO_FILTER_MAPPINGS
} from "../repositories/tipo-afastamento.repository";
import { BaseService, type ListConfig } from "./base.service";

const SORTABLE_COLUMNS = ["id", "nome"] as const;

export class TipoAfastamentoService extends BaseService<
  TipoAfastamento,
  TipoAfastamentoQueryDto,
  TipoAfastamentoDto,
  CreateTipoAfastamentoDto,
  ReplaceTipoAfastamentoDto,
  UpdateTipoAfastamentoDto
> {
  protected readonly repository: TipoAfastamentoRepository;
  protected readonly listConfig: ListConfig<TipoAfastamento> = {
    filterMappings: TIPO_AFASTAMENTO_FILTER_MAPPINGS,
    sortableColumns: [...SORTABLE_COLUMNS],
    defaultSortBy: "id",
    defaultSortOrder: "ASC"
  };
  protected readonly entityName = "tipo afastamento";

  constructor(repository?: TipoAfastamentoRepository) {
    super();
    this.repository = repository ?? new TipoAfastamentoRepository();
  }
}
