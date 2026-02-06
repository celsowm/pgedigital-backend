import { Classificacao } from "../entities/Classificacao";
import type {
  ClassificacaoDto,
  ClassificacaoQueryDto,
  CreateClassificacaoDto,
  ReplaceClassificacaoDto,
  UpdateClassificacaoDto
} from "../dtos/classificacao/classificacao.dtos";
import {
  ClassificacaoRepository,
  CLASSIFICACAO_FILTER_MAPPINGS
} from "../repositories/classificacao.repository";
import { BaseService, type ListConfig } from "./base.service";

const SORTABLE_COLUMNS = ["id", "nome", "peso"] as const;

export class ClassificacaoService extends BaseService<
  Classificacao,
  ClassificacaoQueryDto,
  ClassificacaoDto,
  CreateClassificacaoDto,
  ReplaceClassificacaoDto,
  UpdateClassificacaoDto
> {
  protected readonly repository: ClassificacaoRepository;
  protected readonly listConfig: ListConfig<Classificacao> = {
    filterMappings: CLASSIFICACAO_FILTER_MAPPINGS,
    sortableColumns: [...SORTABLE_COLUMNS],
    defaultSortBy: "id",
    defaultSortOrder: "ASC"
  };

  protected readonly entityName = "classificação";

  constructor(repository?: ClassificacaoRepository) {
    super();
    this.repository = repository ?? new ClassificacaoRepository();
  }
}
