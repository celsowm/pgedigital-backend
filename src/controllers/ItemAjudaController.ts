import { Bindings, Controller, Delete, Get, Post, Put } from 'adorn-api';
import { entityDto, filtersFromEntity } from 'adorn-api/metal-orm';
import type { OrmSession } from 'metal-orm';
import { ItemAjuda } from '../entities/index.js';
import {
  createItemAjuda,
  deleteItemAjuda,
  getItemAjuda,
  listItemAjuda,
  updateItemAjuda,
  type ItemAjudaCreateInput,
  type ItemAjudaListQuery,
  type ItemAjudaUpdateInput,
} from '../services/item-ajuda-service.js';
import { idParamSchema } from './controller-schemas.js';

const listItemAjudaQuerySchema = filtersFromEntity(ItemAjuda, {
  pick: ['identificador'] as const,
});

const createItemAjudaSchema = entityDto(ItemAjuda, 'create');
const updateItemAjudaSchema = entityDto(ItemAjuda, 'update');

@Controller('/api/item-ajuda')
export class ItemAjudaController {
  constructor(private session: OrmSession) {}

  @Get('/', { validate: { query: listItemAjudaQuerySchema } })
  async list(query: ItemAjudaListQuery) {
    return listItemAjuda(this.session, query);
  }

  @Bindings({ path: { id: 'int' } })
  @Get('/{id}', { validate: { params: idParamSchema } })
  async find(id: number) {
    return getItemAjuda(this.session, id);
  }

  @Post('/', { validate: { body: createItemAjudaSchema } })
  async create(body: ItemAjudaCreateInput) {
    return createItemAjuda(this.session, body);
  }

  @Bindings({ path: { id: 'int' } })
  @Put('/{id}', { validate: { params: idParamSchema, body: updateItemAjudaSchema } })
  async update(id: number, body: ItemAjudaUpdateInput) {
    return updateItemAjuda(this.session, id, body);
  }

  @Bindings({ path: { id: 'int' } })
  @Delete('/{id}', { validate: { params: idParamSchema } })
  async remove(id: number) {
    await deleteItemAjuda(this.session, id);
    return { success: true, message: `ItemAjuda ${id} deleted` };
  }
}
