import { TipoMigracaoAcervo } from "../entities/TipoMigracaoAcervo";
import { TipoMigracaoAcervoRepository } from "../repositories/tipo-migracao-acervo.repository";
import { BaseService, type ListConfig } from "./base.service";

export class TipoMigracaoAcervoService extends BaseService<TipoMigracaoAcervo> {
  protected readonly repository: TipoMigracaoAcervoRepository;
  protected readonly listConfig: ListConfig<TipoMigracaoAcervo> = {
    filterMappings: {},
    defaultSortBy: "nome",
    defaultSortOrder: "ASC"
  };

  protected readonly entityName = "tipo migração acervo";

  constructor(repository?: TipoMigracaoAcervoRepository) {
    super();
    this.repository = repository ?? new TipoMigracaoAcervoRepository();
  }
}
