import { HttpError, applyInput } from "adorn-api";
import { withSession } from "../db/mssql";
import { ExitoSucumbencia } from "../entities/ExitoSucumbencia";
import type {
  CreateExitoSucumbenciaDto,
  ExitoSucumbenciaDto,
  ExitoSucumbenciaQueryDto,
  ReplaceExitoSucumbenciaDto,
  UpdateExitoSucumbenciaDto
} from "../dtos/exito-sucumbencia/exito-sucumbencia.dtos";
import {
  ExitoSucumbenciaRepository,
  EXITO_SUCUMBENCIA_FILTER_MAPPINGS,
  type ExitoSucumbenciaFilterFields
} from "../repositories/exito-sucumbencia.repository";
import { BaseService, type ListConfig } from "./base.service";

const SORTABLE_COLUMNS = ["id", "nome"] as const;

export class ExitoSucumbenciaService extends BaseService<ExitoSucumbencia, ExitoSucumbenciaFilterFields, ExitoSucumbenciaQueryDto> {
  protected readonly repository: ExitoSucumbenciaRepository;
  protected readonly listConfig: ListConfig<ExitoSucumbencia, ExitoSucumbenciaFilterFields> = {
    filterMappings: EXITO_SUCUMBENCIA_FILTER_MAPPINGS,
    sortableColumns: [...SORTABLE_COLUMNS],
    defaultSortBy: "id",
    defaultSortOrder: "ASC"
  };
  private readonly entityName = "êxito de sucumbência";

  constructor(repository?: ExitoSucumbenciaRepository) {
    super();
    this.repository = repository ?? new ExitoSucumbenciaRepository();
  }
  async getOne(id: number): Promise<ExitoSucumbenciaDto> {
    return withSession(async (session) => {
      const exitoSucumbencia = await this.repository.findById(session, id);
      if (!exitoSucumbencia) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      return exitoSucumbencia as ExitoSucumbenciaDto;
    });
  }

  async create(input: CreateExitoSucumbenciaDto): Promise<ExitoSucumbenciaDto> {
    return withSession(async (session) => {
      const exitoSucumbencia = new ExitoSucumbencia();
      applyInput(exitoSucumbencia, input as Partial<ExitoSucumbencia>, { partial: false });
      await session.persist(exitoSucumbencia);
      await session.commit();
      return exitoSucumbencia as ExitoSucumbenciaDto;
    });
  }

  async replace(id: number, input: ReplaceExitoSucumbenciaDto): Promise<ExitoSucumbenciaDto> {
    return withSession(async (session) => {
      const exitoSucumbencia = await this.repository.findById(session, id);
      if (!exitoSucumbencia) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      applyInput(exitoSucumbencia, input as Partial<ExitoSucumbencia>, { partial: false });
      await session.commit();
      return exitoSucumbencia as ExitoSucumbenciaDto;
    });
  }

  async update(id: number, input: UpdateExitoSucumbenciaDto): Promise<ExitoSucumbenciaDto> {
    return withSession(async (session) => {
      const exitoSucumbencia = await this.repository.findById(session, id);
      if (!exitoSucumbencia) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      applyInput(exitoSucumbencia, input as Partial<ExitoSucumbencia>, { partial: true });
      await session.commit();
      return exitoSucumbencia as ExitoSucumbenciaDto;
    });
  }

  async remove(id: number): Promise<void> {
    return withSession(async (session) => {
      const exitoSucumbencia = await this.repository.findById(session, id);
      if (!exitoSucumbencia) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      await session.remove(exitoSucumbencia);
      await session.commit();
    });
  }
}
