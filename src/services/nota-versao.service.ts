import { withSession } from '../config/database';
import { NotaVersaoRepository, type NotaVersaoFilters, type PaginationParams } from '../repositories/nota-versao.repository';
import { NotaVersao } from '../entities/NotaVersao';
import { HttpError } from 'adorn-api';

export class NotaVersaoService {
  async findAll(filters?: NotaVersaoFilters, pagination?: Partial<PaginationParams>) {
    return withSession(async (session) => {
      const repository = new NotaVersaoRepository(session);
      
      const page = pagination?.page || 1;
      const pageSize = pagination?.pageSize || 25;
      
      return repository.findAll({ filters, pagination: { page, pageSize } });
    });
  }

  async findById(id: number, includeDeleted = false) {
    return withSession(async (session) => {
      const repository = new NotaVersaoRepository(session);
      return repository.findById(id, includeDeleted);
    });
  }

  async create(data: CreateNotaVersaoData) {
    return withSession(async (session) => {
      const repository = new NotaVersaoRepository(session);

      const notaVersao = new NotaVersao();
      notaVersao.data = data.data;
      notaVersao.sprint = data.sprint;
      notaVersao.ativo = data.ativo;
      notaVersao.mensagem = data.mensagem;

      await repository.create(notaVersao);
      await session.commit();

      return notaVersao;
    });
  }

  async replace(id: number, data: ReplaceNotaVersaoData) {
    return withSession(async (session) => {
      const repository = new NotaVersaoRepository(session);
      const notaVersao = await repository.findById(id);

      if (!notaVersao) {
        throw new HttpError(404, 'Nota versão not found');
      }

      notaVersao.data = data.data;
      notaVersao.sprint = data.sprint;
      notaVersao.ativo = data.ativo;
      notaVersao.mensagem = data.mensagem;

      await repository.update(notaVersao);
      await session.commit();

      return notaVersao;
    });
  }

  async update(id: number, data: UpdateNotaVersaoData) {
    return withSession(async (session) => {
      const repository = new NotaVersaoRepository(session);
      const notaVersao = await repository.findById(id);

      if (!notaVersao) {
        throw new HttpError(404, 'Nota versão not found');
      }

      if (data.data !== undefined) {
        notaVersao.data = data.data;
      }
      if (data.sprint !== undefined) {
        notaVersao.sprint = data.sprint;
      }
      if (data.ativo !== undefined) {
        notaVersao.ativo = data.ativo;
      }
      if (data.mensagem !== undefined) {
        notaVersao.mensagem = data.mensagem;
      }

      await repository.update(notaVersao);
      await session.commit();

      return notaVersao;
    });
  }

  async softDelete(id: number) {
    return withSession(async (session) => {
      const repository = new NotaVersaoRepository(session);
      await repository.softDelete(id);
      await session.commit();
    });
  }

  async softInactivate(id: number) {
    return withSession(async (session) => {
      const repository = new NotaVersaoRepository(session);
      await repository.softInactivate(id);
      await session.commit();
    });
  }

  async restore(id: number) {
    return withSession(async (session) => {
      const repository = new NotaVersaoRepository(session);
      const notaVersao = await repository.restore(id);
      await session.commit();
      return notaVersao;
    });
  }

  async hardDelete(id: number) {
    return withSession(async (session) => {
      const repository = new NotaVersaoRepository(session);
      await repository.hardDelete(id);
      await session.commit();
    });
  }

  async count(filters?: NotaVersaoFilters) {
    return withSession(async (session) => {
      const repository = new NotaVersaoRepository(session);
      return repository.count(filters);
    });
  }
}

export interface CreateNotaVersaoData {
  data: Date;
  sprint: number;
  ativo: boolean;
  mensagem: string;
}

export interface ReplaceNotaVersaoData {
  data: Date;
  sprint: number;
  ativo: boolean;
  mensagem: string;
}

export interface UpdateNotaVersaoData {
  data?: Date;
  sprint?: number;
  ativo?: boolean;
  mensagem?: string;
}
