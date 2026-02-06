import { NotaVersao } from "../entities/NotaVersao";
import type {
  CreateNotaVersaoDto,
  NotaVersaoDto,
  NotaVersaoQueryDto,
  ReplaceNotaVersaoDto,
  UpdateNotaVersaoDto
} from "../dtos/nota-versao/nota-versao.dtos";
import {
  NotaVersaoRepository,
  NOTA_VERSAO_FILTER_MAPPINGS
} from "../repositories/nota-versao.repository";
import { BaseService, type ListConfig } from "./base.service";

const SORTABLE_COLUMNS = ["id", "data", "sprint", "ativo"] as const;

export class NotaVersaoService extends BaseService<
  NotaVersao,
  NotaVersaoQueryDto,
  NotaVersaoDto,
  CreateNotaVersaoDto,
  ReplaceNotaVersaoDto,
  UpdateNotaVersaoDto
> {
  protected readonly repository: NotaVersaoRepository;
  protected readonly listConfig: ListConfig<NotaVersao> = {
    filterMappings: NOTA_VERSAO_FILTER_MAPPINGS,
    sortableColumns: [...SORTABLE_COLUMNS],
    defaultSortBy: "id",
    defaultSortOrder: "ASC"
  };
  protected readonly entityName = "nota versao";

  constructor(repository?: NotaVersaoRepository) {
    super();
    this.repository = repository ?? new NotaVersaoRepository();
  }
}
