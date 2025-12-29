import type { Request as ExpressRequest } from 'express';
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
} from 'adorn-api';
import { AdornController } from './adorn-controller.js';

@Controller('/api/nota-versao')
export class NotaVersaoController implements AdornController {
  requireSession!: (request: ExpressRequest) => any;

  @Get('/')
  async list(request: ExpressRequest) {
    const query = request.query;
    // Mock data for now
    return {
      items: [
        {
          id: 1,
          data: '2025-01-01',
          sprint: 1,
          ativo: true,
          mensagem: 'Primeira versão do sistema'
        },
        {
          id: 2,
          data: '2025-01-15',
          sprint: 2,
          ativo: true,
          mensagem: 'Segunda versão com melhorias'
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
      data: '2025-01-01',
      sprint: id,
      ativo: true,
      mensagem: `Nota de versão ${id}`
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
    return { success: true, message: `NotaVersao ${id} deleted` };
  }
}
