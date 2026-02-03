import { selectFromEntity } from "metal-orm";
import { Usuario } from "../entities/Usuario";
import { BaseRepository, createFilterMappings } from "./base.repository";

export type UsuarioFilterFields = "nome" | "cargo" | "especializada_id";

export const USUARIO_FILTER_MAPPINGS = createFilterMappings<UsuarioFilterFields>({
  nomeContains: { field: "nome", operator: "contains" },
  cargoContains: { field: "cargo", operator: "contains" },
  especializadaId: { field: "especializada_id", operator: "equals" }
});

export class UsuarioRepository extends BaseRepository<Usuario> {
  readonly entityClass = Usuario;

  override buildListQuery(): ReturnType<typeof selectFromEntity<Usuario>> {
    return selectFromEntity(Usuario)
      .includePick("especializada", ["nome", "sigla"])
      .orderBy(this.entityRef.id, "ASC");
  }
}
