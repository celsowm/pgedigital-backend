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
  getEntityOrThrow,
  parseFilter,
  parseIdOrThrow,
  parsePagination,
  type RequestContext
} from "adorn-api";
import {
  applyFilter,
  entityRef,
  selectFromEntity,
  toPagedResponse,
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
import { deleteEntity } from "../../utils/controller-helpers";

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
export class NotaVersaoController {
  @Get("/")
  @Query(NotaVersaoQueryDtoClass)
  @Returns(NotaVersaoPagedResponseDto)
  async list(ctx: RequestContext<unknown, NotaVersaoQueryDto>): Promise<unknown> {
    const paginationQuery = (ctx.query ?? {}) as Record<string, unknown>;
    const { page, pageSize } = parsePagination(paginationQuery);
    const filters = parseFilter<NotaVersao, NotaVersaoFilterFields>(
      paginationQuery,
      NOTA_VERSAO_FILTER_MAPPINGS
    );

    return withSession(async (session) => {
      const query = applyFilter(
        selectFromEntity(NotaVersao).orderBy(notaVersaoRef.id, "ASC"),
        NotaVersao,
        filters
      );
      const paged = await query.executePaged(session, { page, pageSize });
      return toPagedResponse(paged);
    });
  }

  @Get("/:id")
  @Params(NotaVersaoParamsDto)
  @Returns(NotaVersaoDto)
  @NotaVersaoErrors
  async getOne(ctx: RequestContext<unknown, undefined, NotaVersaoParamsDto>): Promise<NotaVersaoDto> {
    return withSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "nota versao");
      const notaVersao = await getEntityOrThrow(session, NotaVersao, id, "nota versao");
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
      const notaVersao = await getEntityOrThrow(session, NotaVersao, id, "nota versao");
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
      const notaVersao = await getEntityOrThrow(session, NotaVersao, id, "nota versao");
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
      await deleteEntity(session, NotaVersao, id, "nota versao");
    });
  }
}
