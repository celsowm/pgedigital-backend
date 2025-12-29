import { Bindings, Controller, Delete, Get, Post, Put } from 'adorn-api';
import { entityDto, filtersFromEntity } from 'adorn-api/metal-orm';
import type { OrmSession } from 'metal-orm';
import { ItemAjuda } from '../entities/index.js';
import {
  itemAjudaService,
  type ItemAjudaCreateInput,
  type ItemAjudaListQuery,
  type ItemAjudaUpdateInput,
} from '../services/item-ajuda-service.js';
import type { PagedResponse } from '../services/service-types.js';
import { BaseCrudController } from './base-crud-controller.js';
import { idParamSchema } from './controller-schemas.js';

const listItemAjudaQuerySchema = filtersFromEntity(ItemAjuda, {
  pick: ['identificador'] as const,
});

const createItemAjudaSchema = entityDto(ItemAjuda, 'create');
const updateItemAjudaSchema = entityDto(ItemAjuda, 'update');

@Controller('/api/item-ajuda')
export class ItemAjudaController extends BaseCrudController<
  ItemAjuda,
  ItemAjudaCreateInput,
  ItemAjudaUpdateInput,
  ItemAjudaListQuery
> {
  constructor(session: OrmSession) {
    super(session, itemAjudaService, ItemAjuda.name);
  }

  @Get('/', { validate: { query: listItemAjudaQuerySchema } })
  async list(query: ItemAjudaListQuery): Promise<PagedResponse<ItemAjuda>> {
    return super.list(query);
  }

  @Bindings({ path: { id: 'int' } })
  @Get('/{id}', { validate: { params: idParamSchema } })
  async find(id: number): Promise<ItemAjuda> {
    return super.find(id);
  }

  @Post('/', { validate: { body: createItemAjudaSchema } })
  async create(body: ItemAjudaCreateInput): Promise<ItemAjuda> {
    return super.create(body);
  }

  @Bindings({ path: { id: 'int' } })
  @Put('/{id}', { validate: { params: idParamSchema, body: updateItemAjudaSchema } })
  async update(id: number, body: ItemAjudaUpdateInput): Promise<ItemAjuda> {
    return super.update(id, body);
  }

  @Bindings({ path: { id: 'int' } })
  @Delete('/{id}', { validate: { params: idParamSchema } })
  async remove(id: number): Promise<{ success: true; message: string }> {
    return super.remove(id);
  }
}
