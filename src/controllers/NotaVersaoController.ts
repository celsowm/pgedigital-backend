import type { Request as ExpressRequest } from 'express';
import {
  Body,
  Controller,
  Delete,
  Get,
  Path,
  Post,
  Put,
  Query,
  Request,
  Response,
  Route,
  SuccessResponse,
  Tags,
} from 'tsoa';
import type { OrmSession } from 'metal-orm';
import {
  NotaVersaoCreateInput,
  NotaVersaoResponse,
  NotaVersaoListResponse,
  NotaVersaoUpdateInput,
  NotaVersaoListQuery,
  createNotaVersao,
  deleteNotaVersao,
  getNotaVersao,
  listNotaVersao,
  updateNotaVersao,
} from '../services/nota-versao-service.js';

type RequestWithSession = ExpressRequest & { ormSession?: OrmSession };

@Route('nota-versao')
@Tags('NotaVersao')
export class NotaVersaoController extends Controller {
  private requireSession(request: RequestWithSession): OrmSession {
    if (!request.ormSession) {
      throw new Error('Orm session is missing from the request');
    }
    return request.ormSession;
  }

  @Get()
  public async list(
    @Request() request: ExpressRequest,
    @Query() sprint?: number,
    @Query() ativo?: boolean,
    @Query() includeInactive?: boolean,
    @Query() page?: number,
    @Query() pageSize?: number,
  ): Promise<NotaVersaoListResponse> {
    const query: NotaVersaoListQuery = {
      sprint,
      ativo,
      includeInactive,
      page,
      pageSize,
    };
    return listNotaVersao(this.requireSession(request), query);
  }

  @Get('{id}')
  @Response(404, 'NotaVersao not found')
  public async find(
    @Request() request: ExpressRequest,
    @Path() id: number,
  ): Promise<NotaVersaoResponse> {
    return getNotaVersao(this.requireSession(request), id);
  }

  @Post()
  @SuccessResponse('201', 'Created')
  public async create(
    @Request() request: ExpressRequest,
    @Body() payload: NotaVersaoCreateInput,
  ): Promise<NotaVersaoResponse> {
    this.setStatus(201);
    return createNotaVersao(this.requireSession(request), payload);
  }

  @Put('{id}')
  @Response(404, 'NotaVersao not found')
  public async update(
    @Request() request: ExpressRequest,
    @Path() id: number,
    @Body() payload: NotaVersaoUpdateInput,
  ): Promise<NotaVersaoResponse> {
    return updateNotaVersao(this.requireSession(request), id, payload);
  }

  @Delete('{id}')
  @Response(404, 'NotaVersao not found')
  @SuccessResponse('204', 'No Content')
  public async remove(
    @Request() request: ExpressRequest,
    @Path() id: number,
  ): Promise<void> {
    await deleteNotaVersao(this.requireSession(request), id);
    this.setStatus(204);
  }
}
