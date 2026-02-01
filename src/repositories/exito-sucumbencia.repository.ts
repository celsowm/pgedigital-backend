import { ExitoSucumbencia } from "../entities/ExitoSucumbencia";
import { BaseRepository, createFilterMappings } from "./base.repository";

export type ExitoSucumbenciaFilterFields = "nome";

export const EXITO_SUCUMBENCIA_FILTER_MAPPINGS = createFilterMappings<ExitoSucumbenciaFilterFields>({
  nomeContains: { field: "nome", operator: "contains" }
});

export class ExitoSucumbenciaRepository extends BaseRepository<ExitoSucumbencia> {
  readonly entityClass = ExitoSucumbencia;
}
