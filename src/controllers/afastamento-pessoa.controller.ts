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
  AfastamentoPessoaDetailDto,
  CreateAfastamentoPessoaDto,
  ReplaceAfastamentoPessoaDto,
  UpdateAfastamentoPessoaDto,
  AfastamentoPessoaParamsDto,
  AfastamentoPessoaPagedResponseDto,
  AfastamentoPessoaQueryDto,
  AfastamentoPessoaQueryDtoClass,
  AfastamentoPessoaErrors
} from "../dtos/afastamento-pessoa/afastamento-pessoa.dtos";
import { AfastamentoPessoaService } from "../services/afastamento-pessoa.service";

@Controller("/afastamento-pessoa")
export class AfastamentoPessoaController {
  private readonly service = new AfastamentoPessoaService();

  @Get("/")
  @Query(AfastamentoPessoaQueryDtoClass)
  @Returns(AfastamentoPessoaPagedResponseDto)
  async list(ctx: RequestContext<unknown, AfastamentoPessoaQueryDto>): Promise<unknown> {
    return this.service.list(ctx.query ?? {});
  }

  @Get("/:id")
  @Params(AfastamentoPessoaParamsDto)
  @Returns(AfastamentoPessoaDetailDto)
  @AfastamentoPessoaErrors
  async getOne(
    ctx: RequestContext<unknown, undefined, AfastamentoPessoaParamsDto>
  ): Promise<AfastamentoPessoaDetailDto> {
    const id = parseIdOrThrow(ctx.params.id, "afastamento pessoa");
    return this.service.getOne(id);
  }

  @Post("/")
  @Body(CreateAfastamentoPessoaDto)
  @Returns({ status: 201, schema: AfastamentoPessoaDetailDto })
  async create(
    ctx: RequestContext<CreateAfastamentoPessoaDto>
  ): Promise<AfastamentoPessoaDetailDto> {
    return this.service.create(ctx.body as CreateAfastamentoPessoaDto);
  }

  @Put("/:id")
  @Params(AfastamentoPessoaParamsDto)
  @Body(ReplaceAfastamentoPessoaDto)
  @Returns(AfastamentoPessoaDetailDto)
  @AfastamentoPessoaErrors
  async replace(
    ctx: RequestContext<ReplaceAfastamentoPessoaDto, undefined, AfastamentoPessoaParamsDto>
  ): Promise<AfastamentoPessoaDetailDto> {
    const id = parseIdOrThrow(ctx.params.id, "afastamento pessoa");
    return this.service.replace(id, ctx.body as ReplaceAfastamentoPessoaDto);
  }

  @Patch("/:id")
  @Params(AfastamentoPessoaParamsDto)
  @Body(UpdateAfastamentoPessoaDto)
  @Returns(AfastamentoPessoaDetailDto)
  @AfastamentoPessoaErrors
  async update(
    ctx: RequestContext<UpdateAfastamentoPessoaDto, undefined, AfastamentoPessoaParamsDto>
  ): Promise<AfastamentoPessoaDetailDto> {
    const id = parseIdOrThrow(ctx.params.id, "afastamento pessoa");
    return this.service.update(id, ctx.body as UpdateAfastamentoPessoaDto);
  }

  @Delete("/:id")
  @Params(AfastamentoPessoaParamsDto)
  @Returns({ status: 204 })
  @AfastamentoPessoaErrors
  async remove(ctx: RequestContext<unknown, undefined, AfastamentoPessoaParamsDto>): Promise<void> {
    const id = parseIdOrThrow(ctx.params.id, "afastamento pessoa");
    await this.service.remove(id);
  }
}
