import { FilaCircular } from "../entities/FilaCircular";
import { BaseRepository, createFilterMappings } from "./base.repository";

export type FilaCircularFilterFields = never;

export const FILA_CIRCULAR_FILTER_MAPPINGS = createFilterMappings<FilaCircularFilterFields>({});

export class FilaCircularRepository extends BaseRepository<FilaCircular> {
  readonly entityClass = FilaCircular;

  constructor() {
    super({ defaultLabelField: "ultimo_elemento" });
  }
}
