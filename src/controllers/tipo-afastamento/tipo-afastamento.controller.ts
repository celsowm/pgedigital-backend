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
import { TipoAfastamento } from "../../entities/TipoAfastamento";
import {
  TipoAfastamentoDto,
  CreateTipoAfastamentoDto,
  ReplaceTipoAfastamentoDto,
  UpdateTipoAfastamentoDto,
  TipoAfastamentoParamsDto,
  TipoAfastamentoPagedResponseDto,
  TipoAfastamentoQueryDto,
  TipoAfastamentoQueryDtoClass,
  TipoAfastamentoErrors,
  TipoAfastamentoOptionsDto,
  TipoAfastamentoOptionDto
} from "../../dtos/tipo-afastamento/tipo-afastamento.dtos";
import { BaseController } from "../../utils/base-controller";

const TipoAfastamentoRef = entityRef(TipoAfastamento);

type TipoAfastamentoFilterFields = "nome";

const TIPO_AFASTAMENTO_FILTER_MAPPINGS = {
  nomeContains: { field: "nome", operator: "contains" }
} satisfies Record<string, { field: TipoAfastamentoFilterFields; operator: "equals" | "contains" }>;

@Controller("/tipo-afastamento")
export class TipoAfastamentoController extends BaseController<TipoAfastamento, TipoAfastamentoFilterFields> {
  get entityClass() {
    return TipoAfastamento;
  }

  get entityRef(): any {
    return TipoAfastamentoRef;
  }

  get filterMappings(): Record<string, { field: TipoAfastamentoFilterFields; operator: "equals" | "contains" }> {
    return TIPO_AFASTAMENTO_FILTER_MAPPINGS;
  }

  get entityName() {
    return "tipo afastamento";
  }

  @Get("/")
  @Query(TipoAfastamentoQueryDtoClass)
  @Returns(TipoAfastamentoPagedResponseDto)
  async list(ctx: RequestContext<unknown, TipoAfastamentoQueryDto>): Promise<unknown> {
    return super.list(ctx);
  }

  @Get("/options")
  @Query(TipoAfastamentoQueryDtoClass)
  @Returns(TipoAfastamentoOptionsDto)
  async listOptions(
    ctx: RequestContext<unknown, TipoAfastamentoQueryDto>
  ): Promise<TipoAfastamentoOptionDto[]> {
    return super.listOptions(ctx);
  }

  @Get("/:id")
  @Params(TipoAfastamentoParamsDto)
  @Returns(TipoAfastamentoDto)
  @TipoAfastamentoErrors
  async getOne(ctx: RequestContext<unknown, undefined, TipoAfastamentoParamsDto>): Promise<TipoAfastamentoDto> {
    return withSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "tipo afastamento");
      const tipoAfastamento = await super.getEntityOrThrow(session, id);
      return tipoAfastamento as TipoAfastamentoDto;
    });
  }

  @Post("/")
  @Body(CreateTipoAfastamentoDto)
  @Returns({ status: 201, schema: TipoAfastamentoDto })
  async create(ctx: RequestContext<CreateTipoAfastamentoDto>): Promise<TipoAfastamentoDto> {
    return withSession(async (session) => {
      const tipoAfastamento = new TipoAfastamento();
      applyInput(tipoAfastamento, ctx.body as Partial<TipoAfastamento>, { partial: false });
      await session.persist(tipoAfastamento);
      await session.commit();
      return tipoAfastamento as TipoAfastamentoDto;
    });
  }

  @Put("/:id")
  @Params(TipoAfastamentoParamsDto)
  @Body(ReplaceTipoAfastamentoDto)
  @Returns(TipoAfastamentoDto)
  @TipoAfastamentoErrors
  async replace(
    ctx: RequestContext<ReplaceTipoAfastamentoDto, undefined, TipoAfastamentoParamsDto>
  ): Promise<TipoAfastamentoDto> {
    return withSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "tipo afastamento");
      const tipoAfastamento = await super.getEntityOrThrow(session, id);
      applyInput(tipoAfastamento, ctx.body as Partial<TipoAfastamento>, { partial: false });
      await session.commit();
      return tipoAfastamento as TipoAfastamentoDto;
    });
  }

  @Patch("/:id")
  @Params(TipoAfastamentoParamsDto)
  @Body(UpdateTipoAfastamentoDto)
  @Returns(TipoAfastamentoDto)
  @TipoAfastamentoErrors
  async update(
    ctx: RequestContext<UpdateTipoAfastamentoDto, undefined, TipoAfastamentoParamsDto>
  ): Promise<TipoAfastamentoDto> {
    return withSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "tipo afastamento");
      const tipoAfastamento = await super.getEntityOrThrow(session, id);
      applyInput(tipoAfastamento, ctx.body as Partial<TipoAfastamento>, { partial: true });
      await session.commit();
      return tipoAfastamento as TipoAfastamentoDto;
    });
  }

  @Delete("/:id")
  @Params(TipoAfastamentoParamsDto)
  @Returns({ status: 204 })
  @TipoAfastamentoErrors
  async remove(ctx: RequestContext<unknown, undefined, TipoAfastamentoParamsDto>): Promise<void> {
    return withSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "tipo afastamento");
      await super.delete(session, id);
    });
  }
}
