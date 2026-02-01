import {
  HttpError,
  applyInput,
  parseFilter,
  parsePagination
} from "adorn-api";
import { applyFilter, toPagedResponse } from "metal-orm";
import { withSession } from "../db/mssql";
import { TipoAcervo } from "../entities/TipoAcervo";
import type {
  CreateTipoAcervoDto,
  TipoAcervoDto,
  TipoAcervoOptionDto,
  TipoAcervoQueryDto,
  ReplaceTipoAcervoDto,
  UpdateTipoAcervoDto
} from "../dtos/tipo-acervo/tipo-acervo.dtos";
import {
  TipoAcervoRepository,
  TIPO_ACERVO_FILTER_MAPPINGS,
  type TipoAcervoFilterFields
} from "../repositories/tipo-acervo.repository";

export class TipoAcervoService {
  private readonly repository: TipoAcervoRepository;
  private readonly entityName = "tipo acervo";

  constructor(repository?: TipoAcervoRepository) {
    this.repository = repository ?? new TipoAcervoRepository();
  }

  async list(query: TipoAcervoQueryDto): Promise<unknown> {
    const paginationQuery = (query ?? {}) as Record<string, unknown>;
    const { page, pageSize } = parsePagination(paginationQuery);
    const filters = parseFilter<TipoAcervo, TipoAcervoFilterFields>(
      paginationQuery,
      TIPO_ACERVO_FILTER_MAPPINGS
    );

    return withSession(async (session) => {
      const baseQuery = this.repository.buildListQuery();
      const filteredQuery = applyFilter(baseQuery, this.repository.entityClass, filters);
      const paged = await filteredQuery.executePaged(session, { page, pageSize });
      return toPagedResponse(paged);
    });
  }

  async listOptions(query: TipoAcervoQueryDto): Promise<TipoAcervoOptionDto[]> {
    const paginationQuery = (query ?? {}) as Record<string, unknown>;
    const filters = parseFilter<TipoAcervo, TipoAcervoFilterFields>(
      paginationQuery,
      TIPO_ACERVO_FILTER_MAPPINGS
    );

    return withSession(async (session) => {
      let optionsQuery = this.repository.buildOptionsQuery();
      if (filters) {
        optionsQuery = applyFilter(optionsQuery, this.repository.entityClass, filters);
      }
      return optionsQuery.executePlain(session);
    });
  }

  async getOne(id: number): Promise<TipoAcervoDto> {
    return withSession(async (session) => {
      const tipoAcervo = await this.repository.findById(session, id);
      if (!tipoAcervo) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      return tipoAcervo as TipoAcervoDto;
    });
  }

  async create(input: CreateTipoAcervoDto): Promise<TipoAcervoDto> {
    return withSession(async (session) => {
      const tipoAcervo = new TipoAcervo();
      applyInput(tipoAcervo, input as Partial<TipoAcervo>, { partial: false });
      await session.persist(tipoAcervo);
      await session.commit();
      return tipoAcervo as TipoAcervoDto;
    });
  }

  async replace(id: number, input: ReplaceTipoAcervoDto): Promise<TipoAcervoDto> {
    return withSession(async (session) => {
      const tipoAcervo = await this.repository.findById(session, id);
      if (!tipoAcervo) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      applyInput(tipoAcervo, input as Partial<TipoAcervo>, { partial: false });
      await session.commit();
      return tipoAcervo as TipoAcervoDto;
    });
  }

  async update(id: number, input: UpdateTipoAcervoDto): Promise<TipoAcervoDto> {
    return withSession(async (session) => {
      const tipoAcervo = await this.repository.findById(session, id);
      if (!tipoAcervo) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      applyInput(tipoAcervo, input as Partial<TipoAcervo>, { partial: true });
      await session.commit();
      return tipoAcervo as TipoAcervoDto;
    });
  }

  async remove(id: number): Promise<void> {
    return withSession(async (session) => {
      const tipoAcervo = await this.repository.findById(session, id);
      if (!tipoAcervo) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      await session.remove(tipoAcervo);
      await session.commit();
    });
  }
}
