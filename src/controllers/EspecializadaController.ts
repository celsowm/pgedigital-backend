import type { Request as ExpressRequest } from 'express';
import {
  Body,
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
import {
  EspecializadaCreateInput,
  EspecializadaListQuery,
  EspecializadaListResponse,
  EspecializadaResponse,
  EspecializadaUpdateInput,
  createEspecializada,
  deleteEspecializada,
  getEspecializada,
  listEspecializada,
  updateEspecializada,
} from '../services/especializada-service.js';
import { logger } from '../services/logger.js';
import { OrmController } from './OrmController.js';

@Route('especializada')
@Tags('Especializada')
export class EspecializadaController extends OrmController {
  @Get()
  public async list(
    @Request() request: ExpressRequest,
    @Query() nome?: string,
    @Query() responsavel_id?: number,
    @Query() tipo_especializada_id?: number,
    @Query() tipo_localidade_especializada_id?: number,
    @Query() page?: number,
    @Query() pageSize?: number,
  ): Promise<EspecializadaListResponse> {
    logger.debug('query', 'especializada list', {
      nome,
      responsavel_id,
      tipo_especializada_id,
      tipo_localidade_especializada_id,
      page,
      pageSize,
    });

    const query: EspecializadaListQuery = {
      nome,
      responsavel_id,
      tipo_especializada_id,
      tipo_localidade_especializada_id,
      page,
      pageSize,
    };
    return listEspecializada(this.requireSession(request), query);
  }

  @Get('{id}')
  @Response(404, 'Especializada not found')
  public async find(
    @Request() request: ExpressRequest,
    @Path() id: number,
  ): Promise<EspecializadaResponse> {
    return getEspecializada(this.requireSession(request), id);
  }

  @Post()
  @SuccessResponse('201', 'Created')
  public async create(
    @Request() request: ExpressRequest,
    @Body() payload: EspecializadaCreateInput,
  ): Promise<EspecializadaResponse> {
    this.setStatus(201);
    return createEspecializada(this.requireSession(request), payload);
  }

  @Put('{id}')
  @Response(404, 'Especializada not found')
  public async update(
    @Request() request: ExpressRequest,
    @Path() id: number,
    @Body() payload: EspecializadaUpdateInput,
  ): Promise<EspecializadaResponse> {
    return updateEspecializada(this.requireSession(request), id, payload);
  }

  @Delete('{id}')
  @Response(404, 'Especializada not found')
  @SuccessResponse('204', 'No Content')
  public async remove(
    @Request() request: ExpressRequest,
    @Path() id: number,
  ): Promise<void> {
    await deleteEspecializada(this.requireSession(request), id);
    this.setStatus(204);
  }
}
