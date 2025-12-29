import { Bindings, Controller, Delete, Get, Post, Put } from 'adorn-api';
import { entityDto, filtersFromEntity } from 'adorn-api/metal-orm';
import type { OrmSession } from 'metal-orm';
import { Especializada } from '../entities/index.js';
import {
  especializadaService,
  type EspecializadaCreateInput,
  type EspecializadaListQuery,
  type EspecializadaUpdateInput,
} from '../services/especializada-service.js';
import type { PagedResponse } from '../services/service-types.js';
import { BaseCrudController } from './base-crud-controller.js';
import { idParamSchema } from './controller-schemas.js';

const listEspecializadaQuerySchema = filtersFromEntity(Especializada, {
  pick: [
    'nome',
    'responsavel_id',
    'tipo_especializada_id',
    'tipo_localidade_especializada_id',
  ] as const,
});

const createEspecializadaSchema = entityDto(Especializada, 'create');
const updateEspecializadaSchema = entityDto(Especializada, 'update');

@Controller('/api/especializada')
export class EspecializadaController extends BaseCrudController<
  Especializada,
  EspecializadaCreateInput,
  EspecializadaUpdateInput,
  EspecializadaListQuery
> {
  constructor(session: OrmSession) {
    super(session, especializadaService, Especializada.name);
  }

  @Get('/', { validate: { query: listEspecializadaQuerySchema } })
  async list(query: EspecializadaListQuery): Promise<PagedResponse<Especializada>> {
    return super.list(query);
  }

  @Bindings({ path: { id: 'int' } })
  @Get('/{id}', { validate: { params: idParamSchema } })
  async find(id: number): Promise<Especializada> {
    return super.find(id);
  }

  @Post('/', { validate: { body: createEspecializadaSchema } })
  async create(body: EspecializadaCreateInput): Promise<Especializada> {
    return super.create(body);
  }

  @Bindings({ path: { id: 'int' } })
  @Put('/{id}', { validate: { params: idParamSchema, body: updateEspecializadaSchema } })
  async update(id: number, body: EspecializadaUpdateInput): Promise<Especializada> {
    return super.update(id, body);
  }

  @Bindings({ path: { id: 'int' } })
  @Delete('/{id}', { validate: { params: idParamSchema } })
  async remove(id: number): Promise<{ success: true; message: string }> {
    return super.remove(id);
  }
}
