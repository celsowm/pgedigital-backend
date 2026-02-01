import {
  HttpError,
  applyInput,
  parseFilter,
  parsePagination
} from "adorn-api";
import { applyFilter, toPagedResponse } from "metal-orm";
import { withSession } from "../db/mssql";
import { TipoAfastamento } from "../entities/TipoAfastamento";
import type {
  CreateTipoAfastamentoDto,
  TipoAfastamentoDto,
  TipoAfastamentoOptionDto,
  TipoAfastamentoQueryDto,
  ReplaceTipoAfastamentoDto,
  UpdateTipoAfastamentoDto
} from "../dtos/tipo-afastamento/tipo-afastamento.dtos";
import {
  TipoAfastamentoRepository,
  TIPO_AFASTAMENTO_FILTER_MAPPINGS,
  type TipoAfastamentoFilterFields
} from "../repositories/tipo-afastamento.repository";

export class TipoAfastamentoService {
  private readonly repository: TipoAfastamentoRepository;
  private readonly entityName = "tipo afastamento";

  constructor(repository?: TipoAfastamentoRepository) {
    this.repository = repository ?? new TipoAfastamentoRepository();
  }

  async list(query: TipoAfastamentoQueryDto): Promise<unknown> {
    const paginationQuery = (query ?? {}) as Record<string, unknown>;
    const { page, pageSize } = parsePagination(paginationQuery);
    const filters = parseFilter<TipoAfastamento, TipoAfastamentoFilterFields>(
      paginationQuery,
      TIPO_AFASTAMENTO_FILTER_MAPPINGS
    );

    return withSession(async (session) => {
      const baseQuery = this.repository.buildListQuery();
      const filteredQuery = applyFilter(baseQuery, this.repository.entityClass, filters);
      const paged = await filteredQuery.executePaged(session, { page, pageSize });
      return toPagedResponse(paged);
    });
  }

  async listOptions(query: TipoAfastamentoQueryDto): Promise<TipoAfastamentoOptionDto[]> {
    const paginationQuery = (query ?? {}) as Record<string, unknown>;
    const filters = parseFilter<TipoAfastamento, TipoAfastamentoFilterFields>(
      paginationQuery,
      TIPO_AFASTAMENTO_FILTER_MAPPINGS
    );

    return withSession(async (session) => {
      let optionsQuery = this.repository.buildOptionsQuery();
      if (filters) {
        optionsQuery = applyFilter(optionsQuery, this.repository.entityClass, filters);
      }
      return optionsQuery.executePlain(session);
    });
  }

  async getOne(id: number): Promise<TipoAfastamentoDto> {
    return withSession(async (session) => {
      const tipoAfastamento = await this.repository.findById(session, id);
      if (!tipoAfastamento) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      return tipoAfastamento as TipoAfastamentoDto;
    });
  }

  async create(input: CreateTipoAfastamentoDto): Promise<TipoAfastamentoDto> {
    return withSession(async (session) => {
      const tipoAfastamento = new TipoAfastamento();
      applyInput(tipoAfastamento, input as Partial<TipoAfastamento>, { partial: false });
      await session.persist(tipoAfastamento);
      await session.commit();
      return tipoAfastamento as TipoAfastamentoDto;
    });
  }

  async replace(id: number, input: ReplaceTipoAfastamentoDto): Promise<TipoAfastamentoDto> {
    return withSession(async (session) => {
      const tipoAfastamento = await this.repository.findById(session, id);
      if (!tipoAfastamento) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      applyInput(tipoAfastamento, input as Partial<TipoAfastamento>, { partial: false });
      await session.commit();
      return tipoAfastamento as TipoAfastamentoDto;
    });
  }

  async update(id: number, input: UpdateTipoAfastamentoDto): Promise<TipoAfastamentoDto> {
    return withSession(async (session) => {
      const tipoAfastamento = await this.repository.findById(session, id);
      if (!tipoAfastamento) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      applyInput(tipoAfastamento, input as Partial<TipoAfastamento>, { partial: true });
      await session.commit();
      return tipoAfastamento as TipoAfastamentoDto;
    });
  }

  async remove(id: number): Promise<void> {
    return withSession(async (session) => {
      const tipoAfastamento = await this.repository.findById(session, id);
      if (!tipoAfastamento) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      await session.remove(tipoAfastamento);
      await session.commit();
    });
  }
}
