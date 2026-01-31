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
  applyInput,
  parseIdOrThrow,
  type RequestContext
} from "adorn-api";
import { entityRef } from "metal-orm";
import { withSession } from "../../db/mssql";
import { TipoAcervo } from "../../entities/TipoAcervo";
import {
  TipoAcervoDto,
  CreateTipoAcervoDto,
  ReplaceTipoAcervoDto,
  UpdateTipoAcervoDto,
  TipoAcervoParamsDto,
  TipoAcervoPagedResponseDto,
  TipoAcervoQueryDto,
  TipoAcervoQueryDtoClass,
  TipoAcervoErrors,
  TipoAcervoOptionsDto,
  TipoAcervoOptionDto
} from "../../dtos/tipo-acervo/tipo-acervo.dtos";
import { BaseController } from "../../utils/base-controller";

const TipoAcervoRef = entityRef(TipoAcervo);

type TipoAcervoFilterFields = "nome";

const TIPO_ACERVO_FILTER_MAPPINGS = {
  nomeContains: { field: "nome", operator: "contains" }
} satisfies Record<string, { field: TipoAcervoFilterFields; operator: "equals" | "contains" }>;

@Controller("/tipo-acervo")
export class TipoAcervoController extends BaseController<TipoAcervo, TipoAcervoFilterFields> {
  get entityClass() {
    return TipoAcervo;
  }

  get entityRef(): any {
    return TipoAcervoRef;
  }

  get filterMappings(): Record<string, { field: TipoAcervoFilterFields; operator: "equals" | "contains" }> {
    return TIPO_ACERVO_FILTER_MAPPINGS;
  }

  get entityName() {
    return "tipo acervo";
  }

  @Get("/")
  @Query(TipoAcervoQueryDtoClass)
  @Returns(TipoAcervoPagedResponseDto)
  async list(ctx: RequestContext<unknown, TipoAcervoQueryDto>): Promise<unknown> {
    return super.list(ctx);
  }

  @Get("/options")
  @Query(TipoAcervoQueryDtoClass)
  @Returns(TipoAcervoOptionsDto)
  async listOptions(ctx: RequestContext<unknown, TipoAcervoQueryDto>): Promise<TipoAcervoOptionDto[]> {
    return super.listOptions(ctx);
  }

  @Get("/:id")
  @Params(TipoAcervoParamsDto)
  @Returns(TipoAcervoDto)
  @TipoAcervoErrors
  async getOne(ctx: RequestContext<unknown, undefined, TipoAcervoParamsDto>): Promise<TipoAcervoDto> {
    return withSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "tipo acervo");
      const tipoAcervo = await super.getEntityOrThrow(session, id);
      return tipoAcervo as TipoAcervoDto;
    });
  }

  @Post("/")
  @Body(CreateTipoAcervoDto)
  @Returns({ status: 201, schema: TipoAcervoDto })
  async create(ctx: RequestContext<CreateTipoAcervoDto>): Promise<TipoAcervoDto> {
    return withSession(async (session) => {
      const tipoAcervo = new TipoAcervo();
      applyInput(tipoAcervo, ctx.body as Partial<TipoAcervo>, { partial: false });
      await session.persist(tipoAcervo);
      await session.commit();
      return tipoAcervo as TipoAcervoDto;
    });
  }

  @Put("/:id")
  @Params(TipoAcervoParamsDto)
  @Body(ReplaceTipoAcervoDto)
  @Returns(TipoAcervoDto)
  @TipoAcervoErrors
  async replace(
    ctx: RequestContext<ReplaceTipoAcervoDto, undefined, TipoAcervoParamsDto>
  ): Promise<TipoAcervoDto> {
    return withSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "tipo acervo");
      const tipoAcervo = await super.getEntityOrThrow(session, id);
      applyInput(tipoAcervo, ctx.body as Partial<TipoAcervo>, { partial: false });
      await session.commit();
      return tipoAcervo as TipoAcervoDto;
    });
  }

  @Patch("/:id")
  @Params(TipoAcervoParamsDto)
  @Body(UpdateTipoAcervoDto)
  @Returns(TipoAcervoDto)
  @TipoAcervoErrors
  async update(
    ctx: RequestContext<UpdateTipoAcervoDto, undefined, TipoAcervoParamsDto>
  ): Promise<TipoAcervoDto> {
    return withSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "tipo acervo");
      const tipoAcervo = await super.getEntityOrThrow(session, id);
      applyInput(tipoAcervo, ctx.body as Partial<TipoAcervo>, { partial: true });
      await session.commit();
      return tipoAcervo as TipoAcervoDto;
    });
  }

  @Delete("/:id")
  @Params(TipoAcervoParamsDto)
  @Returns({ status: 204 })
  @TipoAcervoErrors
  async remove(ctx: RequestContext<unknown, undefined, TipoAcervoParamsDto>): Promise<void> {
    return withSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "tipo acervo");
      await super.delete(session, id);
    });
  }
}
