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
  PessoaDto,
  CreatePessoaDto,
  ReplacePessoaDto,
  UpdatePessoaDto,
  PessoaParamsDto,
  PessoaPagedResponseDto,
  PessoaQueryDto,
  PessoaQueryDtoClass,
  PessoaErrors,
  PessoaOptionsDto,
  PessoaOptionDto
} from "../dtos/pessoa/pessoa.dtos";
import { PessoaService } from "../services/pessoa.service";

@Controller("/pessoa")
export class PessoaController {
  private readonly service = new PessoaService();

  @Get("/")
  @Query(PessoaQueryDtoClass)
  @Returns(PessoaPagedResponseDto)
  async list(ctx: RequestContext<unknown, PessoaQueryDto>): Promise<unknown> {
    return this.service.list(ctx.query ?? {});
  }

  @Get("/options")
  @Query(PessoaQueryDtoClass)
  @Returns(PessoaOptionsDto)
  async listOptions(ctx: RequestContext<unknown, PessoaQueryDto>): Promise<PessoaOptionDto[]> {
    return this.service.listOptions(ctx.query ?? {});
  }

  @Get("/:id")
  @Params(PessoaParamsDto)
  @Returns(PessoaDto)
  @PessoaErrors
  async getOne(ctx: RequestContext<unknown, undefined, PessoaParamsDto>): Promise<PessoaDto> {
    const id = parseIdOrThrow(ctx.params.id, "pessoa");
    return this.service.getOne(id);
  }

  @Post("/")
  @Body(CreatePessoaDto)
  @Returns({ status: 201, schema: PessoaDto })
  async create(ctx: RequestContext<CreatePessoaDto>): Promise<PessoaDto> {
    return this.service.create(ctx.body as CreatePessoaDto);
  }

  @Put("/:id")
  @Params(PessoaParamsDto)
  @Body(ReplacePessoaDto)
  @Returns(PessoaDto)
  @PessoaErrors
  async replace(
    ctx: RequestContext<ReplacePessoaDto, undefined, PessoaParamsDto>
  ): Promise<PessoaDto> {
    const id = parseIdOrThrow(ctx.params.id, "pessoa");
    return this.service.replace(id, ctx.body as ReplacePessoaDto);
  }

  @Patch("/:id")
  @Params(PessoaParamsDto)
  @Body(UpdatePessoaDto)
  @Returns(PessoaDto)
  @PessoaErrors
  async update(
    ctx: RequestContext<UpdatePessoaDto, undefined, PessoaParamsDto>
  ): Promise<PessoaDto> {
    const id = parseIdOrThrow(ctx.params.id, "pessoa");
    return this.service.update(id, ctx.body as UpdatePessoaDto);
  }

  @Delete("/:id")
  @Params(PessoaParamsDto)
  @Returns({ status: 204 })
  @PessoaErrors
  async remove(ctx: RequestContext<unknown, undefined, PessoaParamsDto>): Promise<void> {
    const id = parseIdOrThrow(ctx.params.id, "pessoa");
    await this.service.remove(id);
  }
}
