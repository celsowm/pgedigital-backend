import {
  Controller,
  Get,
  Query,
  Returns,
  parseFilter,
  parsePagination,
  type RequestContext
} from "adorn-api";
import {
  applyFilter,
  entityRef,
  selectFromEntity,
  toPagedResponse
} from "metal-orm";
import { withSession } from "../db/mssql";
import { Usuario } from "../entities/Usuario";
import {
  UsuarioPagedResponseDto,
  UsuarioQueryDto,
  UsuarioQueryDtoClass,
  UsuarioOptionsDto
} from "../dtos/usuario/usuario.dtos";

const U = entityRef(Usuario);

type UsuarioFilterFields = "nome" | "cargo" | "especializada_id";

const USUARIO_FILTER_MAPPINGS = {
  nomeContains: { field: "nome", operator: "contains" },
  cargoContains: { field: "cargo", operator: "contains" },
  especializadaId: { field: "especializada_id", operator: "equals" }
} satisfies Record<
  string,
  {
    field: UsuarioFilterFields;
    operator: "equals" | "contains";
  }
>;

@Controller("/usuario")
export class UsuarioController {
  @Get("/")
  @Query(UsuarioQueryDtoClass)
  @Returns(UsuarioPagedResponseDto)
  async list(ctx: RequestContext<unknown, UsuarioQueryDto>): Promise<unknown> {
    const paginationQuery = (ctx.query ?? {}) as Record<string, unknown>;
    const { page, pageSize } = parsePagination(paginationQuery);
    const filters = parseFilter<Usuario, UsuarioFilterFields>(
      paginationQuery,
      USUARIO_FILTER_MAPPINGS
    );

    return withSession(async (session) => {
      const query = applyFilter(
        selectFromEntity(Usuario)
          .includePick("especializada", ["nome", "sigla"])
          .orderBy(U.id, "ASC"),
        Usuario,
        filters
      );

      const paged = await query.executePaged(session, { page, pageSize });
      return toPagedResponse(paged);
    });
  }

  @Get("/options")
  @Query(UsuarioQueryDtoClass)
  @Returns(UsuarioOptionsDto)
  async listOptions(ctx: RequestContext<unknown, UsuarioQueryDto>): Promise<Array<{ id: number; nome: string }>> {
    const paginationQuery = (ctx.query ?? {}) as Record<string, unknown>;
    const filters = parseFilter<Usuario, UsuarioFilterFields>(
      paginationQuery,
      USUARIO_FILTER_MAPPINGS
    );

    return withSession(async (session) => {
      const query = applyFilter(
        selectFromEntity(Usuario)
          .select({ id: U.id, nome: U.nome })
          .orderBy(U.nome, "ASC"),
        Usuario,
        filters
      );

      return query.executePlain(session);
    });
  }
}
