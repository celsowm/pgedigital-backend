import {
  Body,
  Controller,
  Delete,
  Get,
  Params,
  Patch,
  Post,
  Put,
  Query,
  Returns,
  parseIdOrThrow,
  type RequestContext
} from "adorn-api";
import {
  FilaCircularDto,
  CreateFilaCircularDto,
  ReplaceFilaCircularDto,
  UpdateFilaCircularDto,
  FilaCircularParamsDto,
  FilaCircularPagedResponseDto,
  FilaCircularQueryDto,
  FilaCircularQueryDtoClass,
  FilaCircularOptionsQueryDto,
  FilaCircularOptionsQueryDtoClass,
  FilaCircularErrors,
  FilaCircularOptionsDto,
  FilaCircularOptionDto
} from "../dtos/fila-circular/fila-circular.dtos";
import { FilaCircularService } from "../services/fila-circular.service";

@Controller("/fila-circular")
export class FilaCircularController {
  private readonly service = new FilaCircularService();

  @Get("/")
  @Query(FilaCircularQueryDtoClass)
  @Returns(FilaCircularPagedResponseDto)
  async list(ctx: RequestContext<unknown, FilaCircularQueryDto>): Promise<unknown> {
    return this.service.list(ctx.query ?? {});
  }

  @Get("/options")
  @Query(FilaCircularOptionsQueryDtoClass)
  @Returns(FilaCircularOptionsDto)
  async listOptions(ctx: RequestContext<unknown, FilaCircularOptionsQueryDto>): Promise<FilaCircularOptionDto[]> {
    return this.service.listOptions(ctx.query ?? {});
  }

  @Get("/:id")
  @Params(FilaCircularParamsDto)
  @Returns(FilaCircularDto)
  @FilaCircularErrors
  async getOne(ctx: RequestContext<unknown, undefined, FilaCircularParamsDto>): Promise<FilaCircularDto> {
    const id = parseIdOrThrow(ctx.params.id, "fila circular");
    return this.service.getOne(id);
  }

  @Post("/")
  @Body(CreateFilaCircularDto)
  @Returns({ status: 201, schema: FilaCircularDto })
  async create(ctx: RequestContext<CreateFilaCircularDto>): Promise<FilaCircularDto> {
    return this.service.create(ctx.body as CreateFilaCircularDto);
  }

  @Put("/:id")
  @Params(FilaCircularParamsDto)
  @Body(ReplaceFilaCircularDto)
  @Returns(FilaCircularDto)
  @FilaCircularErrors
  async replace(
    ctx: RequestContext<ReplaceFilaCircularDto, undefined, FilaCircularParamsDto>
  ): Promise<FilaCircularDto> {
    const id = parseIdOrThrow(ctx.params.id, "fila circular");
    return this.service.replace(id, ctx.body as ReplaceFilaCircularDto);
  }

  @Patch("/:id")
  @Params(FilaCircularParamsDto)
  @Body(UpdateFilaCircularDto)
  @Returns(FilaCircularDto)
  @FilaCircularErrors
  async update(
    ctx: RequestContext<UpdateFilaCircularDto, undefined, FilaCircularParamsDto>
  ): Promise<FilaCircularDto> {
    const id = parseIdOrThrow(ctx.params.id, "fila circular");
    return this.service.update(id, ctx.body as UpdateFilaCircularDto);
  }

  @Delete("/:id")
  @Params(FilaCircularParamsDto)
  @Returns({ status: 204 })
  @FilaCircularErrors
  async remove(ctx: RequestContext<unknown, undefined, FilaCircularParamsDto>): Promise<void> {
    const id = parseIdOrThrow(ctx.params.id, "fila circular");
    await this.service.remove(id);
  }
}
