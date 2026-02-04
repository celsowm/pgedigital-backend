import { withSession } from "../db/mssql";
import type { TipoMigracaoAcervoOptionDto } from "../dtos/tipo-migracao-acervo/tipo-migracao-acervo.dtos";
import { TipoMigracaoAcervoRepository } from "../repositories/tipo-migracao-acervo.repository";

export class TipoMigracaoAcervoService {
  private readonly repository: TipoMigracaoAcervoRepository;

  constructor(repository?: TipoMigracaoAcervoRepository) {
    this.repository = repository ?? new TipoMigracaoAcervoRepository();
  }

  async listOptions(): Promise<TipoMigracaoAcervoOptionDto[]> {
    return withSession(async (session) => {
      const query = this.repository.buildOptionsQuery();
      return query.executePlain(session) as unknown as TipoMigracaoAcervoOptionDto[];
    });
  }
}
