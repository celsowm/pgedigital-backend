import type { Request } from 'express';
import {
  Body,
  Controller,
  Delete,
  Get,
  Path,
  Post,
  Put,
  Query,
  Response,
  Route,
  SuccessResponse,
  Tags,
} from 'tsoa';
import type { OrmSession } from 'metal-orm';
import {
  NotaVersaoCreateInput,
  NotaVersaoResponse,
  NotaVersaoUpdateInput,
  NotaVersaoListQuery,
  createNotaVersao,
  deleteNotaVersao,
  getNotaVersao,
  listNotaVersao,
  updateNotaVersao,
} from '../services/nota-versao-service.js';

type RequestWithSession = Request & { ormSession?: OrmSession };

@Route('nota-versao')
@Tags('NotaVersao')
export class NotaVersaoController extends Controller {
  private get session(): OrmSession {
    const req = this.request as RequestWithSession;
    if (!req.ormSession) {
      throw new Error('Orm session is missing from the request');
    }
    return req.ormSession;
  }

  @Get()
  public async list(
    @Query() sprint?: number,
    @Query() ativo?: boolean,
    @Query() includeInactive?: boolean,
  ): Promise<NotaVersaoResponse[]> {
    const query: NotaVersaoListQuery = { sprint, ativo, includeInactive };
    return listNotaVersao(this.session, query);
  }

  @Get('{id}')
  @Response(404, 'NotaVersao not found')
  public async find(@Path() id: number): Promise<NotaVersaoResponse> {
    return getNotaVersao(this.session, id);
  }

  @Post()
  @SuccessResponse('201', 'Created')
  public async create(@Body() payload: NotaVersaoCreateInput): Promise<NotaVersaoResponse> {
    this.setStatus(201);
    return createNotaVersao(this.session, payload);
  }

  @Put('{id}')
  @Response(404, 'NotaVersao not found')
  public async update(
    @Path() id: number,
    @Body() payload: NotaVersaoUpdateInput,
  ): Promise<NotaVersaoResponse> {
    return updateNotaVersao(this.session, id, payload);
  }

  @Delete('{id}')
  @Response(404, 'NotaVersao not found')
  @SuccessResponse('204', 'No Content')
  public async remove(@Path() id: number): Promise<void> {
    await deleteNotaVersao(this.session, id);
    this.setStatus(204);
  }
}
