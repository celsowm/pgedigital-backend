import {
  HttpError,
  applyInput,
  parseFilter,
  parsePagination
} from "adorn-api";
import { applyFilter, toPagedResponse } from "metal-orm";
import { withSession } from "../db/mssql";
import { ExitoSucumbencia } from "../entities/ExitoSucumbencia";
import type {
  CreateExitoSucumbenciaDto,
  ExitoSucumbenciaDto,
  ExitoSucumbenciaOptionDto,
  ExitoSucumbenciaQueryDto,
  ReplaceExitoSucumbenciaDto,
  UpdateExitoSucumbenciaDto
} from "../dtos/exito-sucumbencia/exito-sucumbencia.dtos";
import {
  ExitoSucumbenciaRepository,
  EXITO_SUCUMBENCIA_FILTER_MAPPINGS,
  type ExitoSucumbenciaFilterFields
} from "../repositories/exito-sucumbencia.repository";

export class ExitoSucumbenciaService {
  private readonly repository: ExitoSucumbenciaRepository;
  private readonly entityName = "êxito de sucumbência";

  constructor(repository?: ExitoSucumbenciaRepository) {
    this.repository = repository ?? new ExitoSucumbenciaRepository();
  }

  async list(query: ExitoSucumbenciaQueryDto): Promise<unknown> {
    const paginationQuery = (query ?? {}) as Record<string, unknown>;
    const { page, pageSize } = parsePagination(paginationQuery);
    const filters = parseFilter<ExitoSucumbencia, ExitoSucumbenciaFilterFields>(
      paginationQuery,
      EXITO_SUCUMBENCIA_FILTER_MAPPINGS
    );

    return withSession(async (session) => {
      const baseQuery = this.repository.buildListQuery();
      const filteredQuery = applyFilter(baseQuery, this.repository.entityClass, filters);
      const paged = await filteredQuery.executePaged(session, { page, pageSize });
      return toPagedResponse(paged);
    });
  }

  async listOptions(query: ExitoSucumbenciaQueryDto): Promise<ExitoSucumbenciaOptionDto[]> {
    const paginationQuery = (query ?? {}) as Record<string, unknown>;
    const filters = parseFilter<ExitoSucumbencia, ExitoSucumbenciaFilterFields>(
      paginationQuery,
      EXITO_SUCUMBENCIA_FILTER_MAPPINGS
    );

    return withSession(async (session) => {
      let optionsQuery = this.repository.buildOptionsQuery();
      if (filters) {
        optionsQuery = applyFilter(optionsQuery, this.repository.entityClass, filters);
      }
      return optionsQuery.executePlain(session);
    });
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
