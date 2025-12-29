import { Bindings, Controller, Delete, Get, Post, Put, v } from 'adorn-api';
import { entityDto } from 'adorn-api/metal-orm';
import type { OrmSession } from 'metal-orm';
import { NotaVersao } from '../entities/index.js';
import {
  createNotaVersao,
  deleteNotaVersao,
  getNotaVersao,
  listNotaVersao,
  updateNotaVersao,
  type NotaVersaoCreateInput,
  type NotaVersaoListQuery,
  type NotaVersaoUpdateInput,
} from '../services/nota-versao-service.js';
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
export class NotaVersaoController {
  constructor(private session: OrmSession) {}

  @Get('/', { validate: { query: listNotaVersaoQuerySchema } })
  async list(query: NotaVersaoListQuery) {
    return listNotaVersao(this.session, query);
  }

  @Bindings({ path: { id: 'int' } })
  @Get('/{id}', { validate: { params: idParamSchema } })
  async find(id: number) {
    return getNotaVersao(this.session, id);
  }

  @Post('/', { validate: { body: createNotaVersaoSchema } })
  async create(body: NotaVersaoCreateInput) {
    return createNotaVersao(this.session, body);
  }

  @Bindings({ path: { id: 'int' } })
  @Put('/{id}', { validate: { params: idParamSchema, body: updateNotaVersaoSchema } })
  async update(id: number, body: NotaVersaoUpdateInput) {
    return updateNotaVersao(this.session, id, body);
  }

  @Bindings({ path: { id: 'int' } })
  @Delete('/{id}', { validate: { params: idParamSchema } })
  async remove(id: number) {
    await deleteNotaVersao(this.session, id);
    return { success: true, message: `NotaVersao ${id} deleted` };
  }
}
