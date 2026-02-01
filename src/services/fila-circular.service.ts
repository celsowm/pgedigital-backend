import {
  HttpError,
  applyInput,
  parseFilter,
  parsePagination
} from "adorn-api";
import { applyFilter, toPagedResponse } from "metal-orm";
import { withSession } from "../db/mssql";
import { FilaCircular } from "../entities/FilaCircular";
import type {
  CreateFilaCircularDto,
  FilaCircularDto,
  FilaCircularOptionDto,
  FilaCircularQueryDto,
  ReplaceFilaCircularDto,
  UpdateFilaCircularDto
} from "../dtos/fila-circular/fila-circular.dtos";
import {
  FilaCircularRepository,
  FILA_CIRCULAR_FILTER_MAPPINGS,
  type FilaCircularFilterFields
} from "../repositories/fila-circular.repository";

export class FilaCircularService {
  private readonly repository: FilaCircularRepository;
  private readonly entityName = "fila circular";

  constructor(repository?: FilaCircularRepository) {
    this.repository = repository ?? new FilaCircularRepository();
  }

  async list(query: FilaCircularQueryDto): Promise<unknown> {
    const paginationQuery = (query ?? {}) as Record<string, unknown>;
    const { page, pageSize } = parsePagination(paginationQuery);
    const filters = parseFilter<FilaCircular, FilaCircularFilterFields>(
      paginationQuery,
      FILA_CIRCULAR_FILTER_MAPPINGS
    );

    return withSession(async (session) => {
      const baseQuery = this.repository.buildListQuery();
      const filteredQuery = applyFilter(baseQuery, this.repository.entityClass, filters);
      const paged = await filteredQuery.executePaged(session, { page, pageSize });
      return toPagedResponse(paged);
    });
  }

  async listOptions(query: FilaCircularQueryDto): Promise<FilaCircularOptionDto[]> {
    const paginationQuery = (query ?? {}) as Record<string, unknown>;
    const filters = parseFilter<FilaCircular, FilaCircularFilterFields>(
      paginationQuery,
      FILA_CIRCULAR_FILTER_MAPPINGS
    );

    return withSession(async (session) => {
      let optionsQuery = this.repository.buildOptionsQuery("ultimo_elemento");
      if (filters) {
        optionsQuery = applyFilter(optionsQuery, this.repository.entityClass, filters);
      }
      return optionsQuery.executePlain(session);
    });
  }

  async getOne(id: number): Promise<FilaCircularDto> {
    return withSession(async (session) => {
      const filaCircular = await this.repository.findById(session, id);
      if (!filaCircular) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      return filaCircular as FilaCircularDto;
    });
  }

  async create(input: CreateFilaCircularDto): Promise<FilaCircularDto> {
    return withSession(async (session) => {
      const filaCircular = new FilaCircular();
      applyInput(filaCircular, input as Partial<FilaCircular>, { partial: false });
      await session.persist(filaCircular);
      await session.commit();
      return filaCircular as FilaCircularDto;
    });
  }

  async replace(id: number, input: ReplaceFilaCircularDto): Promise<FilaCircularDto> {
    return withSession(async (session) => {
      const filaCircular = await this.repository.findById(session, id);
      if (!filaCircular) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      applyInput(filaCircular, input as Partial<FilaCircular>, { partial: false });
      await session.commit();
      return filaCircular as FilaCircularDto;
    });
  }

  async update(id: number, input: UpdateFilaCircularDto): Promise<FilaCircularDto> {
    return withSession(async (session) => {
      const filaCircular = await this.repository.findById(session, id);
      if (!filaCircular) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      applyInput(filaCircular, input as Partial<FilaCircular>, { partial: true });
      await session.commit();
      return filaCircular as FilaCircularDto;
    });
  }

  async remove(id: number): Promise<void> {
    return withSession(async (session) => {
      const filaCircular = await this.repository.findById(session, id);
      if (!filaCircular) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      await session.remove(filaCircular);
      await session.commit();
    });
  }
}
