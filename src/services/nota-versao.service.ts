import { HttpError, applyInput } from "adorn-api";
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
import { BaseService, type ListConfig } from "./base.service";

const SORTABLE_COLUMNS = ["id", "data", "sprint", "ativo"] as const;

export class NotaVersaoService extends BaseService<NotaVersao, NotaVersaoQueryDto> {
  protected readonly repository: NotaVersaoRepository;
  protected readonly listConfig: ListConfig<NotaVersao> = {
    filterMappings: NOTA_VERSAO_FILTER_MAPPINGS,
    sortableColumns: [...SORTABLE_COLUMNS],
    defaultSortBy: "id",
    defaultSortOrder: "ASC"
  };
  private readonly entityName = "nota versao";

  constructor(repository?: NotaVersaoRepository) {
    super();
    this.repository = repository ?? new NotaVersaoRepository();
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
