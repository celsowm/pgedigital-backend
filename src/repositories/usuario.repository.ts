import { entityRef, selectFromEntity } from "metal-orm";
import { Usuario } from "../entities/Usuario";

const U = entityRef(Usuario);

export type UsuarioFilterFields = "nome" | "cargo" | "especializada_id";

export const USUARIO_FILTER_MAPPINGS = {
  nomeContains: { field: "nome", operator: "contains" },
  cargoContains: { field: "cargo", operator: "contains" },
  especializadaId: { field: "especializada_id", operator: "equals" }
} satisfies Record<string, { field: UsuarioFilterFields; operator: "equals" | "contains" }>;

export class UsuarioRepository {
  readonly entityClass = Usuario;
  readonly entityRef: any = U;

  buildListQuery(): any {
    return selectFromEntity(Usuario)
      .includePick("especializada", ["nome", "sigla"])
      .orderBy(this.entityRef.id, "ASC");
  }

  buildOptionsQuery(): any {
    return selectFromEntity(Usuario)
      .select({ id: this.entityRef.id, nome: this.entityRef.nome })
      .orderBy(this.entityRef.nome, "ASC");
  }
}

