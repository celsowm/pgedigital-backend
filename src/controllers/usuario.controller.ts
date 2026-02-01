import {
  Controller,
  Get,
  Query,
  Returns,
  type RequestContext
} from "adorn-api";
import {
  UsuarioPagedResponseDto,
  UsuarioQueryDto,
  UsuarioQueryDtoClass,
  UsuarioOptionsDto
} from "../dtos/usuario/usuario.dtos";
import { UsuarioService } from "../services/usuario.service";

@Controller("/usuario")
export class UsuarioController {
  private readonly service = new UsuarioService();

  @Get("/")
  @Query(UsuarioQueryDtoClass)
  @Returns(UsuarioPagedResponseDto)
  async list(ctx: RequestContext<unknown, UsuarioQueryDto>): Promise<unknown> {
    return this.service.list(ctx.query ?? {});
  }

  @Get("/options")
  @Query(UsuarioQueryDtoClass)
  @Returns(UsuarioOptionsDto)
  async listOptions(ctx: RequestContext<unknown, UsuarioQueryDto>): Promise<Array<{ id: number; nome: string }>> {
    return this.service.listOptions(ctx.query ?? {});
  }
}
