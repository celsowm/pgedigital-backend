import type { Request as ExpressRequest } from 'express';
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
} from 'adorn-api';
import { AdornController } from './adorn-controller.js';

@Controller('/api/especializada')
export class EspecializadaController implements AdornController {
  requireSession!: (request: ExpressRequest) => any;

  @Get('/')
  async list(request: ExpressRequest) {
    const query = request.query;
    // Mock data for now since database env vars are not set
    const mockData = {
      items: [
        {
          id: 1,
          nome: 'Especializada Test 1',
          responsavel_id: 1,
          usa_pge_digital: true,
          codigo_ad: 123,
          usa_plantao_audiencia: false,
          restricao_ponto_focal: false,
          especializada_triagem: false,
        }
      ],
      pagination: {
        page: 1,
        pageSize: 10,
        totalItems: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      }
    };
    return mockData;
  }

  @Get('/{id}')
  async find(request: ExpressRequest) {
    const id = Number(request.params.id);
    return {
      id,
      nome: `Especializada ${id}`,
      responsavel_id: 1,
      usa_pge_digital: true,
      codigo_ad: 123,
      usa_plantao_audiencia: false,
      restricao_ponto_focal: false,
      especializada_triagem: false,
    };
  }

  @Post('/')
  async create(request: ExpressRequest) {
    const body = request.body;
    return {
      id: Date.now(), // Generate temporary ID
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
    return { success: true, message: `Especializada ${id} deleted` };
  }
}
