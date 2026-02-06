import { Usuario } from "../entities/Usuario";
import type { UsuarioQueryDto } from "../dtos/usuario/usuario.dtos";
import {
  UsuarioRepository,
  USUARIO_FILTER_MAPPINGS
} from "../repositories/usuario.repository";
import { BaseService, type ListConfig } from "./base.service";

const SORTABLE_COLUMNS = ["id", "nome", "login", "cargo"] as const;

export class UsuarioService extends BaseService<Usuario, UsuarioQueryDto> {
  protected readonly repository: UsuarioRepository;
  protected readonly listConfig: ListConfig<Usuario> = {
    filterMappings: USUARIO_FILTER_MAPPINGS,
    sortableColumns: [...SORTABLE_COLUMNS],
    defaultSortBy: "id",
    defaultSortOrder: "ASC"
  };

  protected readonly entityName = "usuário";

  constructor(repository?: UsuarioRepository) {
    super();
    this.repository = repository ?? new UsuarioRepository();
  }
}
