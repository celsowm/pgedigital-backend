import { Materia } from "../entities/Materia";
import { BaseRepository, createFilterMappings } from "./base.repository";

export type MateriaFilterFields = "nome";

export const MATERIA_FILTER_MAPPINGS = createFilterMappings<Record<string, unknown>>({
  nomeContains: { field: "nome", operator: "contains" }
});

export class MateriaRepository extends BaseRepository<Materia> {
  readonly entityClass = Materia;
}
