import { ClasseProcessual } from "../entities/ClasseProcessual";
import { BaseRepository, createFilterMappings } from "./base.repository";

export type ClasseProcessualFilterFields = "nome";

export const CLASSE_PROCESSUAL_FILTER_MAPPINGS = createFilterMappings<ClasseProcessualFilterFields>({
  nomeContains: { field: "nome", operator: "contains" }
});

export class ClasseProcessualRepository extends BaseRepository<ClasseProcessual> {
  readonly entityClass = ClasseProcessual;
}
