import { HttpError } from 'adorn-api';
import { NotaVersao } from '../../entities/NotaVersao.js';
import { NotaVersaoRepository, type Session } from './nota-versao.repository.js';
import type {
  NotaVersaoDto,
  CreateNotaVersaoDto,
  ReplaceNotaVersaoDto,
  UpdateNotaVersaoDto,
  NotaVersaoQueryDto,
} from './nota-versao.dtos.js';

function parseInteger(value: unknown, options: { min?: number } = {}): number | undefined {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    return undefined;
  }
  if (options.min !== undefined && value < options.min) {
    return undefined;
  }
  return value;
}

export function requireNotaVersaoId(value: unknown): number {
  const id = parseInteger(value, { min: 1 });
  if (id === undefined) {
    throw new HttpError(400, 'ID inválido.');
  }
  return id;
}

export class NotaVersaoService {
  private repository: NotaVersaoRepository;

  constructor(session: Session) {
    this.repository = new NotaVersaoRepository(session);
  }

  async list(query?: NotaVersaoQueryDto, page = 1, pageSize = 20) {
    return this.repository.findPaged(query, page, pageSize);
  }

  async getById(id: number): Promise<NotaVersaoDto> {
    const nota = await this.repository.findById(id);
    if (!nota) {
      throw new HttpError(404, 'Nota de versão não encontrada.');
    }
    return nota as NotaVersaoDto;
  }

  async create(dto: CreateNotaVersaoDto): Promise<NotaVersaoDto> {
    const entity = new NotaVersao();
    entity.data = new Date(dto.data);
    entity.sprint = dto.sprint;
    entity.ativo = dto.ativo;
    entity.mensagem = dto.mensagem;

    await this.repository.persist(entity);
    await this.repository.commit();

    return entity as NotaVersaoDto;
  }

  async replace(id: number, dto: ReplaceNotaVersaoDto): Promise<NotaVersaoDto> {
    const entity = await this.getEntityOrThrow(id);

    entity.data = new Date(dto.data);
    entity.sprint = dto.sprint;
    entity.ativo = dto.ativo;
    entity.mensagem = dto.mensagem;

    await this.repository.commit();

    return entity as NotaVersaoDto;
  }

  async update(id: number, dto: UpdateNotaVersaoDto): Promise<NotaVersaoDto> {
    const entity = await this.getEntityOrThrow(id);

    if (dto.data !== undefined) entity.data = new Date(dto.data);
    if (dto.sprint !== undefined) entity.sprint = dto.sprint;
    if (dto.ativo !== undefined) entity.ativo = dto.ativo;
    if (dto.mensagem !== undefined) entity.mensagem = dto.mensagem;

    await this.repository.commit();

    return entity as NotaVersaoDto;
  }

  async softDelete(id: number): Promise<NotaVersaoDto> {
    const entity = await this.getEntityOrThrow(id);
    entity.data_exclusao = new Date();

    await this.repository.commit();

    return entity as NotaVersaoDto;
  }

  async inativar(id: number): Promise<NotaVersaoDto> {
    const entity = await this.getEntityOrThrow(id);
    entity.ativo = false;
    entity.data_inativacao = new Date();

    await this.repository.commit();

    return entity as NotaVersaoDto;
  }

  async ativar(id: number): Promise<NotaVersaoDto> {
    const entity = await this.getEntityOrThrow(id);
    entity.ativo = true;
    entity.data_inativacao = undefined;

    await this.repository.commit();

    return entity as NotaVersaoDto;
  }

  private async getEntityOrThrow(id: number): Promise<NotaVersao> {
    const nota = await this.repository.findById(id);
    if (!nota) {
      throw new HttpError(404, 'Nota de versão não encontrada.');
    }
    return nota;
  }
}
