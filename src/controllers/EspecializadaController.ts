import { Bindings, Controller, Delete, Get, Post, Put } from 'adorn-api';
import { entityDto, filtersFromEntity } from 'adorn-api/metal-orm';
import type { OrmSession } from 'metal-orm';
import { Especializada } from '../entities/index.js';
import {
  createEspecializada,
  deleteEspecializada,
  getEspecializada,
  listEspecializada,
  updateEspecializada,
  type EspecializadaCreateInput,
  type EspecializadaListQuery,
  type EspecializadaUpdateInput,
} from '../services/especializada-service.js';
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
export class EspecializadaController {
  constructor(private session: OrmSession) {}

  @Get('/', { validate: { query: listEspecializadaQuerySchema } })
  async list(query: EspecializadaListQuery) {
    return listEspecializada(this.session, query);
  }

  @Bindings({ path: { id: 'int' } })
  @Get('/{id}', { validate: { params: idParamSchema } })
  async find(id: number) {
    return getEspecializada(this.session, id);
  }

  @Post('/', { validate: { body: createEspecializadaSchema } })
  async create(body: EspecializadaCreateInput) {
    return createEspecializada(this.session, body);
  }

  @Bindings({ path: { id: 'int' } })
  @Put('/{id}', { validate: { params: idParamSchema, body: updateEspecializadaSchema } })
  async update(id: number, body: EspecializadaUpdateInput) {
    return updateEspecializada(this.session, id, body);
  }

  @Bindings({ path: { id: 'int' } })
  @Delete('/{id}', { validate: { params: idParamSchema } })
  async remove(id: number) {
    await deleteEspecializada(this.session, id);
    return { success: true, message: `Especializada ${id} deleted` };
  }
}
