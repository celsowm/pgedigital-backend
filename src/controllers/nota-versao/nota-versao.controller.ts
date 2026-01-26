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
import { withMssqlSession } from "../../db/mssql";
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

type NotaVersaoInput = CreateNotaVersaoDto | ReplaceNotaVersaoDto | UpdateNotaVersaoDto;

async function getNotaVersaoOrThrow(
  session: OrmSession,
  id: number
): Promise<NotaVersao> {
  const notaVersao = await session.find(NotaVersao, id);
  if (!notaVersao) {
    throw new HttpError(404, "Nota versao not found.");
  }
  return notaVersao;
}

function buildNotaVersaoUpdate(input: NotaVersaoInput) {
  return {
    data: input.data,
    sprint: input.sprint,
    ativo: input.ativo,
    mensagem: input.mensagem,
    data_exclusao: input.data_exclusao ?? undefined,
    data_inativacao: input.data_inativacao ?? undefined
  };
}

function compactUpdates<T extends Record<string, unknown>>(updates: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(updates).filter(([, value]) => value !== undefined)
  ) as Partial<T>;
}

function applyNotaVersaoInput(
  entity: NotaVersao,
  input: NotaVersaoInput,
  options: { partial: boolean }
) {
  const updates = buildNotaVersaoUpdate(input);
  const payload = options.partial ? compactUpdates(updates) : updates;
  Object.assign(entity, payload);
}

function applyNotaVersaoMutation(
  entity: NotaVersao,
  input: CreateNotaVersaoDto | ReplaceNotaVersaoDto
) {
  applyNotaVersaoInput(entity, input, { partial: false });
}

function applyNotaVersaoPatch(entity: NotaVersao, input: UpdateNotaVersaoDto) {
  applyNotaVersaoInput(entity, input, { partial: true });
}

@Controller("/nota-versao")
export class NotaVersaoController {
  @Get("/")
  @Query(NotaVersaoQueryDtoClass)
  @Returns(NotaVersaoPagedResponseDto)
  async list(ctx: RequestContext<unknown, NotaVersaoQueryDto>) {
    const paginationQuery = (ctx.query ?? {}) as Record<string, unknown>;
    const { page, pageSize } = parsePagination(paginationQuery);
    const filters = parseFilter<NotaVersao, NotaVersaoFilterFields>(
      paginationQuery,
      NOTA_VERSAO_FILTER_MAPPINGS
    );

    return withMssqlSession(async (session) => {
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
  async getOne(ctx: RequestContext<unknown, undefined, NotaVersaoParamsDto>) {
    return withMssqlSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "nota versao");
      const notaVersao = await getNotaVersaoOrThrow(session, id);
      return notaVersao as NotaVersaoDto;
    });
  }

  @Post("/")
  @Body(CreateNotaVersaoDto)
  @Returns({ status: 201, schema: NotaVersaoDto })
  async create(ctx: RequestContext<CreateNotaVersaoDto>) {
    return withMssqlSession(async (session) => {
      const notaVersao = new NotaVersao();
      applyNotaVersaoMutation(notaVersao, ctx.body);
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
  ) {
    return withMssqlSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "nota versao");
      const notaVersao = await getNotaVersaoOrThrow(session, id);
      applyNotaVersaoMutation(notaVersao, ctx.body);
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
  ) {
    return withMssqlSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "nota versao");
      const notaVersao = await getNotaVersaoOrThrow(session, id);
      applyNotaVersaoPatch(notaVersao, ctx.body);
      await session.commit();
      return notaVersao as NotaVersaoDto;
    });
  }

  @Delete("/:id")
  @Params(NotaVersaoParamsDto)
  @Returns({ status: 204 })
  @NotaVersaoErrors
  async remove(ctx: RequestContext<unknown, undefined, NotaVersaoParamsDto>) {
    return withMssqlSession(async (session) => {
      const id = parseIdOrThrow(ctx.params.id, "nota versao");
      const notaVersao = await getNotaVersaoOrThrow(session, id);
      await session.remove(notaVersao);
      await session.commit();
    });
  }
}
