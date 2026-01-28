import {
  Body,
  Controller,
  Delete,
  Get,
  HttpError,
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
import {
  entityRef,
  selectFromEntity,
  type OrmSession
} from "metal-orm";
import { withSession } from "../../db/mssql";
import { NotaVersao } from "../../entities/NotaVersao";
import {
  CreateNotaVersaoDto,
  NotaVersaoDto,
  NotaVersaoErrors,
  NotaVersaoPagedResponseDto,
  NotaVersaoParamsDto,
  NotaVersaoQueryDto,
  NotaVersaoQueryDtoClass,
  ReplaceNotaVersaoDto,
  UpdateNotaVersaoDto
} from "../../dtos/nota-versao/nota-versao.dtos";
import { BaseController } from "../../utils/base-controller";

const notaVersaoRef = entityRef(NotaVersao);

type NotaVersaoFilterFields = "sprint" | "ativo" | "mensagem";

const NOTA_VERSAO_FILTER_MAPPINGS = {
  sprint: { field: "sprint", operator: "equals" },
  ativo: { field: "ativo", operator: "equals" },
  mensagemContains: { field: "mensagem", operator: "contains" }
} satisfies Record<
  string,
  {
    field: NotaVersaoFilterFields;
    operator: "equals" | "contains";
  }
>;

@Controller("/nota-versao")
export class NotaVersaoController extends BaseController<NotaVersao, NotaVersaoFilterFields> {
  get entityClass() {
    return NotaVersao;
  }

  get entityRef(): any {
    return notaVersaoRef;
  }

  get filterMappings(): Record<string, { field: NotaVersaoFilterFields; operator: "equals" | "contains" }> {
    return NOTA_VERSAO_FILTER_MAPPINGS;
  }

  get entityName() {
    return "nota versao";
  }
  @Get("/")
  @Query(NotaVersaoQueryDtoClass)
  @Returns(NotaVersaoPagedResponseDto)
  async list(ctx: RequestContext<unknown, NotaVersaoQueryDto>): Promise<unknown> {
    return super.list(ctx);
  }

  @Get("/:id")
  @Params(NotaVersaoParamsDto)
  @Returns(NotaVersaoDto)
  @NotaVersaoErrors
  async getOne(ctx: RequestContext<unknown, undefined, NotaVersaoParamsDto>): Promise<NotaVersaoDto> {
    return withSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "nota versao");
      const notaVersao = await super.getEntityOrThrow(session, id);
      return notaVersao as NotaVersaoDto;
    });
  }

  @Post("/")
  @Body(CreateNotaVersaoDto)
  @Returns({ status: 201, schema: NotaVersaoDto })
  async create(ctx: RequestContext<CreateNotaVersaoDto>): Promise<NotaVersaoDto> {
    return withSession(async (session) => {
      const notaVersao = new NotaVersao();
      applyInput(notaVersao, ctx.body as Partial<NotaVersao>, { partial: false });
      await session.persist(notaVersao);
      await session.commit();
      return notaVersao as NotaVersaoDto;
    });
  }

  @Put("/:id")
  @Params(NotaVersaoParamsDto)
  @Body(ReplaceNotaVersaoDto)
  @Returns(NotaVersaoDto)
  @NotaVersaoErrors
  async replace(
    ctx: RequestContext<ReplaceNotaVersaoDto, undefined, NotaVersaoParamsDto>
  ): Promise<NotaVersaoDto> {
    return withSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "nota versao");
      const notaVersao = await super.getEntityOrThrow(session, id);
      applyInput(notaVersao, ctx.body as Partial<NotaVersao>, { partial: false });
      await session.commit();
      return notaVersao as NotaVersaoDto;
    });
  }

  @Patch("/:id")
  @Params(NotaVersaoParamsDto)
  @Body(UpdateNotaVersaoDto)
  @Returns(NotaVersaoDto)
  @NotaVersaoErrors
  async update(
    ctx: RequestContext<UpdateNotaVersaoDto, undefined, NotaVersaoParamsDto>
  ): Promise<NotaVersaoDto> {
    return withSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "nota versao");
      const notaVersao = await super.getEntityOrThrow(session, id);
      applyInput(notaVersao, ctx.body as Partial<NotaVersao>, { partial: true });
      await session.commit();
      return notaVersao as NotaVersaoDto;
    });
  }

  @Delete("/:id")
  @Params(NotaVersaoParamsDto)
  @Returns({ status: 204 })
  @NotaVersaoErrors
  async remove(ctx: RequestContext<unknown, undefined, NotaVersaoParamsDto>): Promise<void> {
    return withSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "nota versao");
      await super.delete(session, id);
    });
  }
}
