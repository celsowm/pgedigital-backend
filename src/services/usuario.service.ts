import type {
  UsuarioQueryDto
} from "../dtos/usuario/usuario.dtos";
import {
  UsuarioRepository,
  USUARIO_FILTER_MAPPINGS,
  type UsuarioFilterFields
} from "../repositories/usuario.repository";
import { BaseService, type ListConfig } from "./base.service";
import type { Usuario } from "../entities/Usuario";

const SORTABLE_COLUMNS = ["id", "nome", "login", "cargo"] as const;

export class UsuarioService extends BaseService<Usuario, UsuarioFilterFields, UsuarioQueryDto> {
  protected readonly repository: UsuarioRepository;
  protected readonly listConfig: ListConfig<Usuario, UsuarioFilterFields> = {
    filterMappings: USUARIO_FILTER_MAPPINGS,
    sortableColumns: [...SORTABLE_COLUMNS],
    defaultSortBy: "id",
    defaultSortOrder: "ASC"
  };

  constructor(repository?: UsuarioRepository) {
    super();
    this.repository = repository ?? new UsuarioRepository();
  }
}
