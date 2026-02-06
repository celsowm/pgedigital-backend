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
  UsuarioOptionsDto,
  UsuarioOptionsQueryDtoClass,
  type UsuarioOptionsQueryDto
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
  @Query(UsuarioOptionsQueryDtoClass)
  @Returns(UsuarioOptionsDto)
  async listOptions(ctx: RequestContext<unknown, UsuarioOptionsQueryDto>): Promise<Array<{ id: number; nome: string }>> {
    return this.service.listOptions(ctx.query ?? {});
  }
}
