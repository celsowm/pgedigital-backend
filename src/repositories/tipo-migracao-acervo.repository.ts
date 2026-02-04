import { TipoMigracaoAcervo } from "../entities/TipoMigracaoAcervo";
import { BaseRepository } from "./base.repository";

export class TipoMigracaoAcervoRepository extends BaseRepository<TipoMigracaoAcervo> {
  readonly entityClass = TipoMigracaoAcervo;
}
