import {
  HttpError,
  applyInput,
  parseFilter,
  parsePagination
} from "adorn-api";
import { applyFilter, toPagedResponse } from "metal-orm";
import { withSession } from "../db/mssql";
import { NotaVersao } from "../entities/NotaVersao";
import type {
  CreateNotaVersaoDto,
  NotaVersaoDto,
  NotaVersaoQueryDto,
  ReplaceNotaVersaoDto,
  UpdateNotaVersaoDto
} from "../dtos/nota-versao/nota-versao.dtos";
import {
  NotaVersaoRepository,
  NOTA_VERSAO_FILTER_MAPPINGS,
  type NotaVersaoFilterFields
} from "../repositories/nota-versao.repository";

export class NotaVersaoService {
  private readonly repository: NotaVersaoRepository;
  private readonly entityName = "nota versao";

  constructor(repository?: NotaVersaoRepository) {
    this.repository = repository ?? new NotaVersaoRepository();
  }

  async list(query: NotaVersaoQueryDto): Promise<unknown> {
    const paginationQuery = (query ?? {}) as Record<string, unknown>;
    const { page, pageSize } = parsePagination(paginationQuery);
    const filters = parseFilter<NotaVersao, NotaVersaoFilterFields>(
      paginationQuery,
      NOTA_VERSAO_FILTER_MAPPINGS
    );

    return withSession(async (session) => {
      const baseQuery = this.repository.buildListQuery();
      const filteredQuery = applyFilter(baseQuery, this.repository.entityClass, filters);
      const paged = await filteredQuery.executePaged(session, { page, pageSize });
      return toPagedResponse(paged);
    });
  }

  async getOne(id: number): Promise<NotaVersaoDto> {
    return withSession(async (session) => {
      const notaVersao = await this.repository.findById(session, id);
      if (!notaVersao) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      return notaVersao as NotaVersaoDto;
    });
  }

  async create(input: CreateNotaVersaoDto): Promise<NotaVersaoDto> {
    return withSession(async (session) => {
      const notaVersao = new NotaVersao();
      applyInput(notaVersao, input as Partial<NotaVersao>, { partial: false });
      await session.persist(notaVersao);
      await session.commit();
      return notaVersao as NotaVersaoDto;
    });
  }

  async replace(id: number, input: ReplaceNotaVersaoDto): Promise<NotaVersaoDto> {
    return withSession(async (session) => {
      const notaVersao = await this.repository.findById(session, id);
      if (!notaVersao) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      applyInput(notaVersao, input as Partial<NotaVersao>, { partial: false });
      await session.commit();
      return notaVersao as NotaVersaoDto;
    });
  }

  async update(id: number, input: UpdateNotaVersaoDto): Promise<NotaVersaoDto> {
    return withSession(async (session) => {
      const notaVersao = await this.repository.findById(session, id);
      if (!notaVersao) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      applyInput(notaVersao, input as Partial<NotaVersao>, { partial: true });
      await session.commit();
      return notaVersao as NotaVersaoDto;
    });
  }

  async remove(id: number): Promise<void> {
    return withSession(async (session) => {
      const notaVersao = await this.repository.findById(session, id);
      if (!notaVersao) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      await session.remove(notaVersao);
      await session.commit();
    });
  }
}
