import { HttpError, applyInput } from "adorn-api";
import { withSession } from "../db/mssql";
import { TipoAcervo } from "../entities/TipoAcervo";
import type {
  CreateTipoAcervoDto,
  TipoAcervoDto,
  TipoAcervoQueryDto,
  ReplaceTipoAcervoDto,
  UpdateTipoAcervoDto
} from "../dtos/tipo-acervo/tipo-acervo.dtos";
import {
  TipoAcervoRepository,
  TIPO_ACERVO_FILTER_MAPPINGS,
  type TipoAcervoFilterFields
} from "../repositories/tipo-acervo.repository";
import { BaseService, type ListConfig } from "./base.service";

const SORTABLE_COLUMNS = ["id", "nome"] as const;

export class TipoAcervoService extends BaseService<TipoAcervo, TipoAcervoQueryDto> {
  protected readonly repository: TipoAcervoRepository;
  protected readonly listConfig: ListConfig<TipoAcervo> = {
    filterMappings: TIPO_ACERVO_FILTER_MAPPINGS,
    sortableColumns: [...SORTABLE_COLUMNS],
    defaultSortBy: "id",
    defaultSortOrder: "ASC"
  };
  private readonly entityName = "tipo acervo";

  constructor(repository?: TipoAcervoRepository) {
    super();
    this.repository = repository ?? new TipoAcervoRepository();
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
