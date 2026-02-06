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
  MniTribunalDto,
  CreateMniTribunalDto,
  ReplaceMniTribunalDto,
  UpdateMniTribunalDto,
  MniTribunalParamsDto,
  MniTribunalPagedResponseDto,
  MniTribunalQueryDto,
  MniTribunalQueryDtoClass,
  MniTribunalOptionsQueryDto,
  MniTribunalOptionsQueryDtoClass,
  MniTribunalErrors,
  MniTribunalOptionsDto,
  MniTribunalOptionDto
} from "../dtos/mni-tribunal/mni-tribunal.dtos";
import { MniTribunalService } from "../services/mni-tribunal.service";

@Controller("/mni-tribunal")
export class MniTribunalController {
  private readonly service = new MniTribunalService();

  @Get("/")
  @Query(MniTribunalQueryDtoClass)
  @Returns(MniTribunalPagedResponseDto)
  async list(ctx: RequestContext<unknown, MniTribunalQueryDto>): Promise<unknown> {
    return this.service.list(ctx.query ?? {});
  }

  @Get("/options")
  @Query(MniTribunalOptionsQueryDtoClass)
  @Returns(MniTribunalOptionsDto)
  async listOptions(
    ctx: RequestContext<unknown, MniTribunalOptionsQueryDto>
  ): Promise<MniTribunalOptionDto[]> {
    return this.service.listOptions(ctx.query ?? {});
  }

  @Get("/:id")
  @Params(MniTribunalParamsDto)
  @Returns(MniTribunalDto)
  @MniTribunalErrors
  async getOne(ctx: RequestContext<unknown, undefined, MniTribunalParamsDto>): Promise<MniTribunalDto> {
    const id = parseIdOrThrow(ctx.params.id, "MNI Tribunal");
    return this.service.getOne(id);
  }

  @Post("/")
  @Body(CreateMniTribunalDto)
  @Returns({ status: 201, schema: MniTribunalDto })
  async create(ctx: RequestContext<CreateMniTribunalDto>): Promise<MniTribunalDto> {
    return this.service.create(ctx.body as CreateMniTribunalDto);
  }

  @Put("/:id")
  @Params(MniTribunalParamsDto)
  @Body(ReplaceMniTribunalDto)
  @Returns(MniTribunalDto)
  @MniTribunalErrors
  async replace(
    ctx: RequestContext<ReplaceMniTribunalDto, undefined, MniTribunalParamsDto>
  ): Promise<MniTribunalDto> {
    const id = parseIdOrThrow(ctx.params.id, "MNI Tribunal");
    return this.service.replace(id, ctx.body as ReplaceMniTribunalDto);
  }

  @Patch("/:id")
  @Params(MniTribunalParamsDto)
  @Body(UpdateMniTribunalDto)
  @Returns(MniTribunalDto)
  @MniTribunalErrors
  async update(
    ctx: RequestContext<UpdateMniTribunalDto, undefined, MniTribunalParamsDto>
  ): Promise<MniTribunalDto> {
    const id = parseIdOrThrow(ctx.params.id, "MNI Tribunal");
    return this.service.update(id, ctx.body as UpdateMniTribunalDto);
  }

  @Delete("/:id")
  @Params(MniTribunalParamsDto)
  @Returns({ status: 204 })
  @MniTribunalErrors
  async remove(ctx: RequestContext<unknown, undefined, MniTribunalParamsDto>): Promise<void> {
    const id = parseIdOrThrow(ctx.params.id, "MNI Tribunal");
    await this.service.remove(id);
  }
}
