import { Bindings, Controller, Delete, Get, Post, Put, v } from 'adorn-api';
import { entityDto } from 'adorn-api/metal-orm';
import type { OrmSession } from 'metal-orm';
import { NotaVersao } from '../entities/index.js';
import {
  notaVersaoService,
  type NotaVersaoCreateInput,
  type NotaVersaoListQuery,
  type NotaVersaoUpdateInput,
} from '../services/nota-versao-service.js';
import type { PagedResponse } from '../services/service-types.js';
import { BaseCrudController } from './base-crud-controller.js';
import { idParamSchema } from './controller-schemas.js';

const listNotaVersaoQuerySchema = v
  .object({
    page: v.number().int().min(1).optional(),
    pageSize: v.number().int().min(1).max(100).optional(),
    sprint: v.number().int().min(1).optional(),
    ativo: v.boolean().optional(),
    includeInactive: v.boolean().optional(),
    includeDeleted: v.boolean().optional(),
  })
  .strict();

const createNotaVersaoSchema = v
  .object({
    data: v.string(),
    sprint: v.number().int().min(1),
    mensagem: v.string().min(1),
    ativo: v.boolean().optional(),
  })
  .strict();

const updateNotaVersaoSchema = entityDto(NotaVersao, 'update');

@Controller('/api/nota-versao')
export class NotaVersaoController extends BaseCrudController<
  NotaVersao,
  NotaVersaoCreateInput,
  NotaVersaoUpdateInput,
  NotaVersaoListQuery
> {
  constructor(session: OrmSession) {
    super(session, notaVersaoService, NotaVersao.name);
  }

  @Get('/', { validate: { query: listNotaVersaoQuerySchema } })
  async list(query: NotaVersaoListQuery): Promise<PagedResponse<NotaVersao>> {
    return super.list(query);
  }

  @Bindings({ path: { id: 'int' } })
  @Get('/{id}', { validate: { params: idParamSchema } })
  async find(id: number): Promise<NotaVersao> {
    return super.find(id);
  }

  @Post('/', { validate: { body: createNotaVersaoSchema } })
  async create(body: NotaVersaoCreateInput): Promise<NotaVersao> {
    return super.create(body);
  }

  @Bindings({ path: { id: 'int' } })
  @Put('/{id}', { validate: { params: idParamSchema, body: updateNotaVersaoSchema } })
  async update(id: number, body: NotaVersaoUpdateInput): Promise<NotaVersao> {
    return super.update(id, body);
  }

  @Bindings({ path: { id: 'int' } })
  @Delete('/{id}', { validate: { params: idParamSchema } })
  async remove(id: number): Promise<{ success: true; message: string }> {
    return super.remove(id);
  }
}
