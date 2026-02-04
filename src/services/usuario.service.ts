import { parseFilter, parsePagination } from "adorn-api";
import { applyFilter, toPagedResponse } from "metal-orm";
import { withSession } from "../db/mssql";
import { Usuario } from "../entities/Usuario";
import type { UsuarioQueryDto } from "../dtos/usuario/usuario.dtos";
import {
  UsuarioRepository,
  USUARIO_FILTER_MAPPINGS,
  type UsuarioFilterFields
} from "../repositories/usuario.repository";
import { convertThumbnailsInResponse } from "../utils/thumbnail.utils";

export class UsuarioService {
  private readonly repository: UsuarioRepository;

  constructor(repository?: UsuarioRepository) {
    this.repository = repository ?? new UsuarioRepository();
  }

  async list(query: UsuarioQueryDto): Promise<unknown> {
    const paginationQuery = (query ?? {}) as Record<string, unknown>;
    const { page, pageSize } = parsePagination(paginationQuery);
    const filters = parseFilter<Usuario, UsuarioFilterFields>(
      paginationQuery,
      USUARIO_FILTER_MAPPINGS
    );

    return withSession(async (session) => {
      const baseQuery = this.repository.buildListQuery();
      const filteredQuery = applyFilter(baseQuery, this.repository.entityClass, filters);
      const paged = await filteredQuery.executePaged(session, { page, pageSize });
      return convertThumbnailsInResponse(toPagedResponse(paged));
    });
  }

  async listOptions(query: UsuarioQueryDto): Promise<Array<{ id: number; nome: string }>> {
    const paginationQuery = (query ?? {}) as Record<string, unknown>;
    const filters = parseFilter<Usuario, UsuarioFilterFields>(
      paginationQuery,
      USUARIO_FILTER_MAPPINGS
    );

    return withSession(async (session) => {
      let optionsQuery = this.repository.buildOptionsQuery();
      if (filters) {
        optionsQuery = applyFilter(optionsQuery, this.repository.entityClass, filters);
      }
      return optionsQuery.executePlain(session);
    });
  }
}
