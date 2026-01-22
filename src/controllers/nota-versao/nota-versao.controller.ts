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
  parsePagination,
  withSession,
  type RequestContext,
} from 'adorn-api';
import { createSession } from './nota-versao.repository.js';
import { NotaVersaoService, requireNotaVersaoId } from './nota-versao.service.js';
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

@Controller({ path: '/nota-versao', tags: ['Nota Versão'] })
export class NotaVersaoController {
  @Get('/')
  @Query(NotaVersaoQueryDtoClass)
  @Returns(NotaVersaoPagedResponseDto)
  async list(ctx: RequestContext<unknown, NotaVersaoQueryDto>) {
    const paginationQuery = (ctx.query ?? {}) as Record<string, unknown>;
    const { page, pageSize } = parsePagination(paginationQuery);
    return withSession(createSession, async (session) => {
      const service = new NotaVersaoService(session);
      return service.list(ctx.query, page, pageSize);
    });
  }

  @Get('/:id')
  @Params(NotaVersaoParamsDto)
  @Returns(NotaVersaoDto)
  @NotaVersaoErrors
  async getOne(ctx: RequestContext<unknown, undefined, NotaVersaoParamsDto>) {
    const id = requireNotaVersaoId(ctx.params.id);
    return withSession(createSession, async (session) => {
      const service = new NotaVersaoService(session);
      return service.getById(id);
    });
  }

  @Post('/')
  @Body(CreateNotaVersaoDto)
  @Returns({ status: 201, schema: NotaVersaoDto })
  async create(ctx: RequestContext<CreateNotaVersaoDto>) {
    return withSession(createSession, async (session) => {
      const service = new NotaVersaoService(session);
      return service.create(ctx.body);
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
      const service = new NotaVersaoService(session);
      return service.replace(id, ctx.body);
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
      const service = new NotaVersaoService(session);
      return service.update(id, ctx.body);
    });
  }

  @Delete('/:id')
  @Params(NotaVersaoParamsDto)
  @Returns(NotaVersaoDto)
  @NotaVersaoErrors
  async softDelete(ctx: RequestContext<unknown, undefined, NotaVersaoParamsDto>) {
    const id = requireNotaVersaoId(ctx.params.id);
    return withSession(createSession, async (session) => {
      const service = new NotaVersaoService(session);
      return service.softDelete(id);
    });
  }

  @Patch('/:id/inativar')
  @Params(NotaVersaoParamsDto)
  @Returns(NotaVersaoDto)
  @NotaVersaoErrors
  async inativar(ctx: RequestContext<unknown, undefined, NotaVersaoParamsDto>) {
    const id = requireNotaVersaoId(ctx.params.id);
    return withSession(createSession, async (session) => {
      const service = new NotaVersaoService(session);
      return service.inativar(id);
    });
  }

  @Patch('/:id/ativar')
  @Params(NotaVersaoParamsDto)
  @Returns(NotaVersaoDto)
  @NotaVersaoErrors
  async ativar(ctx: RequestContext<unknown, undefined, NotaVersaoParamsDto>) {
    const id = requireNotaVersaoId(ctx.params.id);
    return withSession(createSession, async (session) => {
      const service = new NotaVersaoService(session);
      return service.ativar(id);
    });
  }
}
