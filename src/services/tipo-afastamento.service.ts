import { HttpError, applyInput } from "adorn-api";
import { withSession } from "../db/mssql";
import { TipoAfastamento } from "../entities/TipoAfastamento";
import type {
  CreateTipoAfastamentoDto,
  TipoAfastamentoDto,
  TipoAfastamentoQueryDto,
  ReplaceTipoAfastamentoDto,
  UpdateTipoAfastamentoDto
} from "../dtos/tipo-afastamento/tipo-afastamento.dtos";
import {
  TipoAfastamentoRepository,
  TIPO_AFASTAMENTO_FILTER_MAPPINGS,
  type TipoAfastamentoFilterFields
} from "../repositories/tipo-afastamento.repository";
import { BaseService, type ListConfig } from "./base.service";

const SORTABLE_COLUMNS = ["id", "nome"] as const;

export class TipoAfastamentoService extends BaseService<TipoAfastamento, TipoAfastamentoQueryDto> {
  protected readonly repository: TipoAfastamentoRepository;
  protected readonly listConfig: ListConfig<TipoAfastamento> = {
    filterMappings: TIPO_AFASTAMENTO_FILTER_MAPPINGS,
    sortableColumns: [...SORTABLE_COLUMNS],
    defaultSortBy: "id",
    defaultSortOrder: "ASC"
  };
  private readonly entityName = "tipo afastamento";

  constructor(repository?: TipoAfastamentoRepository) {
    super();
    this.repository = repository ?? new TipoAfastamentoRepository();
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
