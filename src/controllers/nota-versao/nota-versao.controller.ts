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
  parsePagination,
  withSession,
  type RequestContext,
} from 'adorn-api';
import { applyFilter, toPagedResponse, entityRef, selectFromEntity, isNull } from 'metal-orm';
import type { SimpleWhereInput } from 'metal-orm';
import { getOrm } from '../../database/connection.js';
import { NotaVersao } from '../../entities/NotaVersao.js';
import {
  NotaVersaoDto,
  CreateNotaVersaoDto,
  ReplaceNotaVersaoDto,
  UpdateNotaVersaoDto,
  NotaVersaoParamsDto,
  NotaVersaoQueryDto,
  NotaVersaoQueryDtoClass,
  NotaVersaoPagedResponseDto,
  NotaVersaoErrors,
} from './nota-versao.dtos.js';

const notaVersaoRef = entityRef(NotaVersao);

type NotaVersaoFilter = SimpleWhereInput<typeof NotaVersao, 'sprint' | 'ativo' | 'mensagem'>;

function createSession() {
  return getOrm().createSession();
}

function parseInteger(value: unknown, options: { min?: number } = {}): number | undefined {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    return undefined;
  }
  if (options.min !== undefined && value < options.min) {
    return undefined;
  }
  return value;
}

function requireNotaVersaoId(value: unknown): number {
  const id = parseInteger(value, { min: 1 });
  if (id === undefined) {
    throw new HttpError(400, 'ID inválido.');
  }
  return id;
}

async function getNotaVersaoOrThrow(session: ReturnType<typeof createSession>, id: number): Promise<NotaVersao> {
  const nota = await session.find(NotaVersao, id);
  if (!nota) {
    throw new HttpError(404, 'Nota de versão não encontrada.');
  }
  return nota;
}

function buildNotaVersaoFilter(query?: NotaVersaoQueryDto): NotaVersaoFilter | undefined {
  if (!query) {
    return undefined;
  }
  const filter: NotaVersaoFilter = {};
  if (query.sprint !== undefined) {
    filter.sprint = { equals: query.sprint };
  }
  if (query.ativo !== undefined) {
    filter.ativo = { equals: query.ativo };
  }
  if (query.mensagemContains) {
    filter.mensagem = { contains: query.mensagemContains };
  }
  return Object.keys(filter).length ? filter : undefined;
}

@Controller({ path: '/nota-versao', tags: ['Nota Versão'] })
export class NotaVersaoController {
  @Get('/')
  @Query(NotaVersaoQueryDtoClass)
  @Returns(NotaVersaoPagedResponseDto)
  async list(ctx: RequestContext<unknown, NotaVersaoQueryDto>) {
    const paginationQuery = (ctx.query ?? {}) as Record<string, unknown>;
    const { page, pageSize } = parsePagination(paginationQuery);
    return withSession(createSession, async (session) => {
      const filters = buildNotaVersaoFilter(ctx.query);
      const query = applyFilter(
        selectFromEntity(NotaVersao)
          .where(isNull(notaVersaoRef.data_exclusao))
          .orderBy(notaVersaoRef.id, 'DESC'),
        NotaVersao,
        filters
      );
      const paged = await query.executePaged(session, { page, pageSize });
      return toPagedResponse(paged);
    });
  }

  @Get('/:id')
  @Params(NotaVersaoParamsDto)
  @Returns(NotaVersaoDto)
  @NotaVersaoErrors
  async getOne(ctx: RequestContext<unknown, undefined, NotaVersaoParamsDto>) {
    const id = requireNotaVersaoId(ctx.params.id);
    return withSession(createSession, async (session) => {
      const nota = await getNotaVersaoOrThrow(session, id);
      return nota as NotaVersaoDto;
    });
  }

  @Post('/')
  @Body(CreateNotaVersaoDto)
  @Returns({ status: 201, schema: NotaVersaoDto })
  async create(ctx: RequestContext<CreateNotaVersaoDto>) {
    return withSession(createSession, async (session) => {
      const entity = new NotaVersao();
      entity.data = new Date(ctx.body.data);
      entity.sprint = ctx.body.sprint;
      entity.ativo = ctx.body.ativo;
      entity.mensagem = ctx.body.mensagem;

      await session.persist(entity);
      await session.commit();

      return entity as NotaVersaoDto;
    });
  }

  @Put('/:id')
  @Params(NotaVersaoParamsDto)
  @Body(ReplaceNotaVersaoDto)
  @Returns(NotaVersaoDto)
  @NotaVersaoErrors
  async replace(ctx: RequestContext<ReplaceNotaVersaoDto, undefined, NotaVersaoParamsDto>) {
    const id = requireNotaVersaoId(ctx.params.id);
    return withSession(createSession, async (session) => {
      const entity = await getNotaVersaoOrThrow(session, id);

      entity.data = new Date(ctx.body.data);
      entity.sprint = ctx.body.sprint;
      entity.ativo = ctx.body.ativo;
      entity.mensagem = ctx.body.mensagem;

      await session.commit();

      return entity as NotaVersaoDto;
    });
  }

  @Patch('/:id')
  @Params(NotaVersaoParamsDto)
  @Body(UpdateNotaVersaoDto)
  @Returns(NotaVersaoDto)
  @NotaVersaoErrors
  async update(ctx: RequestContext<UpdateNotaVersaoDto, undefined, NotaVersaoParamsDto>) {
    const id = requireNotaVersaoId(ctx.params.id);
    return withSession(createSession, async (session) => {
      const entity = await getNotaVersaoOrThrow(session, id);

      if (ctx.body.data !== undefined) entity.data = new Date(ctx.body.data);
      if (ctx.body.sprint !== undefined) entity.sprint = ctx.body.sprint;
      if (ctx.body.ativo !== undefined) entity.ativo = ctx.body.ativo;
      if (ctx.body.mensagem !== undefined) entity.mensagem = ctx.body.mensagem;

      await session.commit();

      return entity as NotaVersaoDto;
    });
  }

  @Delete('/:id')
  @Params(NotaVersaoParamsDto)
  @Returns(NotaVersaoDto)
  @NotaVersaoErrors
  async softDelete(ctx: RequestContext<unknown, undefined, NotaVersaoParamsDto>) {
    const id = requireNotaVersaoId(ctx.params.id);
    return withSession(createSession, async (session) => {
      const entity = await getNotaVersaoOrThrow(session, id);
      entity.data_exclusao = new Date();

      await session.commit();

      return entity as NotaVersaoDto;
    });
  }

  @Patch('/:id/inativar')
  @Params(NotaVersaoParamsDto)
  @Returns(NotaVersaoDto)
  @NotaVersaoErrors
  async inativar(ctx: RequestContext<unknown, undefined, NotaVersaoParamsDto>) {
    const id = requireNotaVersaoId(ctx.params.id);
    return withSession(createSession, async (session) => {
      const entity = await getNotaVersaoOrThrow(session, id);
      entity.ativo = false;
      entity.data_inativacao = new Date();

      await session.commit();

      return entity as NotaVersaoDto;
    });
  }

  @Patch('/:id/ativar')
  @Params(NotaVersaoParamsDto)
  @Returns(NotaVersaoDto)
  @NotaVersaoErrors
  async ativar(ctx: RequestContext<unknown, undefined, NotaVersaoParamsDto>) {
    const id = requireNotaVersaoId(ctx.params.id);
    return withSession(createSession, async (session) => {
      const entity = await getNotaVersaoOrThrow(session, id);
      entity.ativo = true;
      entity.data_inativacao = undefined;

      await session.commit();

      return entity as NotaVersaoDto;
    });
  }
}
