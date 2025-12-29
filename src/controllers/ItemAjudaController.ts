import type { Request as ExpressRequest } from 'express';
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
} from 'adorn-api';
import { AdornController } from './adorn-controller.js';

@Controller('/api/item-ajuda')
export class ItemAjudaController implements AdornController {
  requireSession!: (request: ExpressRequest) => any;

  @Get('/')
  async list(request: ExpressRequest) {
    const query = request.query;
    // Mock data for now
    return {
      items: [
        {
          id: 1,
          identificador: 'help-001',
          html: '<p>Help content 1</p>'
        },
        {
          id: 2,
          identificador: 'help-002', 
          html: '<p>Help content 2</p>'
        }
      ],
      pagination: {
        page: 1,
        pageSize: 10,
        totalItems: 2,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      }
    };
  }

  @Get('/{id}')
  async find(request: ExpressRequest) {
    const id = Number(request.params.id);
    return {
      id,
      identificador: `help-${id.toString().padStart(3, '0')}`,
      html: `<p>Help content for item ${id}</p>`
    };
  }

  @Post('/')
  async create(request: ExpressRequest) {
    const body = request.body;
    return {
      id: Date.now(),
      ...body,
    };
  }

  @Put('/{id}')
  async update(request: ExpressRequest) {
    const id = Number(request.params.id);
    const body = request.body;
    return {
      id,
      ...body,
    };
  }

  @Delete('/{id}')
  async remove(request: ExpressRequest) {
    const id = Number(request.params.id);
    return { success: true, message: `ItemAjuda ${id} deleted` };
  }
}
