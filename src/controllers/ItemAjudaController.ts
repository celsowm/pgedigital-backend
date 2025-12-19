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
  ItemAjudaCreateInput,
  ItemAjudaListQuery,
  ItemAjudaListResponse,
  ItemAjudaResponse,
  ItemAjudaUpdateInput,
  createItemAjuda,
  deleteItemAjuda,
  getItemAjuda,
  listItemAjuda,
  updateItemAjuda,
} from '../services/item-ajuda-service.js';
import { logger } from '../services/logger.js';
import { OrmController } from './OrmController.js';

@Route('item-ajuda')
@Tags('ItemAjuda')
export class ItemAjudaController extends OrmController {
  @Get()
  public async list(
    @Request() request: ExpressRequest,
    @Query() identificador?: string,
    @Query() page?: number,
    @Query() pageSize?: number,
  ): Promise<ItemAjudaListResponse> {
    logger.debug('query', 'item-ajuda list', { identificador, page, pageSize });

    const query: ItemAjudaListQuery = { identificador, page, pageSize };
    return listItemAjuda(this.requireSession(request), query);
  }

  @Get('{id}')
  @Response(404, 'ItemAjuda not found')
  public async find(
    @Request() request: ExpressRequest,
    @Path() id: number,
  ): Promise<ItemAjudaResponse> {
    return getItemAjuda(this.requireSession(request), id);
  }

  @Post()
  @SuccessResponse('201', 'Created')
  public async create(
    @Request() request: ExpressRequest,
    @Body() payload: ItemAjudaCreateInput,
  ): Promise<ItemAjudaResponse> {
    this.setStatus(201);
    return createItemAjuda(this.requireSession(request), payload);
  }

  @Put('{id}')
  @Response(404, 'ItemAjuda not found')
  public async update(
    @Request() request: ExpressRequest,
    @Path() id: number,
    @Body() payload: ItemAjudaUpdateInput,
  ): Promise<ItemAjudaResponse> {
    return updateItemAjuda(this.requireSession(request), id, payload);
  }

  @Delete('{id}')
  @Response(404, 'ItemAjuda not found')
  @SuccessResponse('204', 'No Content')
  public async remove(
    @Request() request: ExpressRequest,
    @Path() id: number,
  ): Promise<void> {
    await deleteItemAjuda(this.requireSession(request), id);
    this.setStatus(204);
  }
}
