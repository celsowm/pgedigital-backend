import {
  Controller,
  Get,
  Params,
  Query,
  Returns,
  ok,
  noContent,
  parseIdOrThrow,
  type RequestContext,
  HttpResponse
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
import imageType from "image-type";

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
  async getThumbnail(ctx: RequestContext<unknown, undefined, UsuarioParamsDto>) {
    const id = parseIdOrThrow(ctx.params.id, "usuario");
    return withSession(async (session) => {
      const thumbnail = await this.thumbnailRepository.findByUsuarioId(session, id);
      if (!thumbnail || !thumbnail.thumbnail) {
        return noContent();
      }
      return ok({
        thumbnail: thumbnail.thumbnail
      });
    });
  }

  @Get("/:id/thumbnail/image")
  @Params(UsuarioParamsDto)
  @Returns({ status: 200, description: "Thumbnail image" })
  @Returns({ status: 204, description: "No thumbnail available for user" })
  async getThumbnailImage(ctx: RequestContext<unknown, undefined, UsuarioParamsDto>) {
    const id = parseIdOrThrow(ctx.params.id, "usuario");
    return withSession(async (session) => {
      const thumbnail = await this.thumbnailRepository.findByUsuarioId(session, id);
      if (!thumbnail || !thumbnail.thumbnail) {
        return noContent();
      }

      const result = await imageType(thumbnail.thumbnail);
      const mimeType = result?.mime ?? "application/octet-stream";

      const headers: Record<string, string> = {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=86400, immutable"
      };

      if (thumbnail.data_atualizacao) {
        headers["Last-Modified"] = thumbnail.data_atualizacao.toUTCString();
      }

      return new HttpResponse(200, thumbnail.thumbnail, headers);
    });
  }
}


