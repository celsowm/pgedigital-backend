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
  AcervoDetailDto,
  AcervoErrors,
  AcervoOptionDto,
  AcervoOptionsDto,
  AcervoPagedResponseDto,
  AcervoParamsDto,
  AcervoQueryDto,
  AcervoQueryDtoClass,
  AcervoWithRelationsDto,
  CreateAcervoDto,
  ReplaceAcervoDto,
  UpdateAcervoDto
} from "../dtos/acervo/acervo.dtos";
import { AcervoService } from "../services/acervo.service";

@Controller("/acervo")
export class AcervoController {
  private readonly service = new AcervoService();

  @Get("/")
  @Query(AcervoQueryDtoClass)
  @Returns(AcervoPagedResponseDto)
  async list(ctx: RequestContext<unknown, AcervoQueryDto>): Promise<unknown> {
    return this.service.list(ctx.query ?? {});
  }

  @Get("/options")
  @Query(AcervoQueryDtoClass)
  @Returns(AcervoOptionsDto)
  async listOptions(ctx: RequestContext<unknown, AcervoQueryDto>): Promise<AcervoOptionDto[]> {
    return this.service.listOptions(ctx.query ?? {});
  }

  @Get("/:id")
  @Params(AcervoParamsDto)
  @Returns(AcervoDetailDto)
  @AcervoErrors
  async getOne(
    ctx: RequestContext<unknown, undefined, AcervoParamsDto>
  ): Promise<AcervoDetailDto> {
    const id = parseIdOrThrow(ctx.params.id, "acervo");
    return this.service.getDetail(id);
  }

  @Post("/")
  @Body(CreateAcervoDto)
  @Returns({ status: 201, schema: AcervoWithRelationsDto })
  async create(ctx: RequestContext<CreateAcervoDto>): Promise<AcervoWithRelationsDto> {
    return this.service.create(ctx.body as CreateAcervoDto);
  }

  @Put("/:id")
  @Params(AcervoParamsDto)
  @Body(ReplaceAcervoDto)
  @Returns(AcervoWithRelationsDto)
  @AcervoErrors
  async replace(ctx: RequestContext<ReplaceAcervoDto, undefined, AcervoParamsDto>): Promise<AcervoWithRelationsDto> {
    const id = parseIdOrThrow(ctx.params.id, "acervo");
    return this.service.replace(id, ctx.body as ReplaceAcervoDto);
  }

  @Patch("/:id")
  @Params(AcervoParamsDto)
  @Body(UpdateAcervoDto)
  @Returns(AcervoWithRelationsDto)
  @AcervoErrors
  async update(ctx: RequestContext<UpdateAcervoDto, undefined, AcervoParamsDto>): Promise<AcervoWithRelationsDto> {
    const id = parseIdOrThrow(ctx.params.id, "acervo");
    return this.service.update(id, ctx.body as UpdateAcervoDto);
  }

  @Delete("/:id")
  @Params(AcervoParamsDto)
  @Returns({ status: 204 })
  @AcervoErrors
  async remove(ctx: RequestContext<unknown, undefined, AcervoParamsDto>): Promise<void> {
    const id = parseIdOrThrow(ctx.params.id, "acervo");
    await this.service.remove(id);
  }
}
