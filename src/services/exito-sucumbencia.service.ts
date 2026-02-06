import { ExitoSucumbencia } from "../entities/ExitoSucumbencia";
import type {
  CreateExitoSucumbenciaDto,
  ExitoSucumbenciaDto,
  ExitoSucumbenciaQueryDto,
  ReplaceExitoSucumbenciaDto,
  UpdateExitoSucumbenciaDto
} from "../dtos/exito-sucumbencia/exito-sucumbencia.dtos";
import {
  ExitoSucumbenciaRepository,
  EXITO_SUCUMBENCIA_FILTER_MAPPINGS
} from "../repositories/exito-sucumbencia.repository";
import { BaseService, type ListConfig } from "./base.service";

const SORTABLE_COLUMNS = ["id", "nome"] as const;

export class ExitoSucumbenciaService extends BaseService<
  ExitoSucumbencia,
  ExitoSucumbenciaQueryDto,
  ExitoSucumbenciaDto,
  CreateExitoSucumbenciaDto,
  ReplaceExitoSucumbenciaDto,
  UpdateExitoSucumbenciaDto
> {
  protected readonly repository: ExitoSucumbenciaRepository;
  protected readonly listConfig: ListConfig<ExitoSucumbencia> = {
    filterMappings: EXITO_SUCUMBENCIA_FILTER_MAPPINGS,
    sortableColumns: [...SORTABLE_COLUMNS],
    defaultSortBy: "id",
    defaultSortOrder: "ASC"
  };
  protected readonly entityName = "êxito de sucumbência";

  constructor(repository?: ExitoSucumbenciaRepository) {
    super();
    this.repository = repository ?? new ExitoSucumbenciaRepository();
  }
}
