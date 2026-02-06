import {
  Controller,
  Get,
  Params,
  Query,
  Returns,
  parseIdOrThrow,
  type RequestContext
} from "adorn-api";
import { withSession } from "../db/mssql";
import {
  UsuarioPagedResponseDto,
  UsuarioQueryDto,
  UsuarioQueryDtoClass,
  UsuarioOptionsDto,
  UsuarioOptionsQueryDtoClass,
  UsuarioParamsDto,
  UsuarioThumbnailDto,
  type UsuarioOptionsQueryDto
} from "../dtos/usuario/usuario.dtos";
import { UsuarioService } from "../services/usuario.service";
import { UsuarioThumbnailRepository } from "../repositories/usuario-thumbnail.repository";

@Controller("/usuario")
export class UsuarioController {
  private readonly service = new UsuarioService();
  private readonly thumbnailRepository = new UsuarioThumbnailRepository();

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

  @Get("/:id/thumbnail")
  @Params(UsuarioParamsDto)
  @Returns({ status: 200, schema: UsuarioThumbnailDto, description: "Thumbnail found" })
  @Returns({ status: 204, description: "No thumbnail available for user" })
  async getThumbnail(ctx: RequestContext<unknown, undefined, UsuarioParamsDto>): Promise<void> {
    const id = parseIdOrThrow(ctx.params.id, "usuario");
    await withSession(async (session) => {
      const thumbnail = await this.thumbnailRepository.findByUsuarioId(session, id);
      if (!thumbnail || !thumbnail.thumbnail) {
        ctx.res.status(204).end();
        return;
      }
      ctx.res.status(200).json({
        thumbnail: thumbnail.thumbnail.toString("base64")
      });
    });
  }
}
