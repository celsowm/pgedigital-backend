import {
  HttpError,
  applyInput,
  parseFilter,
  parsePagination
} from "adorn-api";
import { applyFilter, toPagedResponse } from "metal-orm";
import { withSession } from "../db/mssql";
import { ClasseProcessual } from "../entities/ClasseProcessual";
import type {
  ClasseProcessualDto,
  ClasseProcessualOptionDto,
  ClasseProcessualQueryDto,
  CreateClasseProcessualDto,
  ReplaceClasseProcessualDto,
  UpdateClasseProcessualDto
} from "../dtos/classe-processual/classe-processual.dtos";
import {
  ClasseProcessualRepository,
  CLASSE_PROCESSUAL_FILTER_MAPPINGS,
  type ClasseProcessualFilterFields
} from "../repositories/classe-processual.repository";

export class ClasseProcessualService {
  private readonly repository: ClasseProcessualRepository;
  private readonly entityName = "classe processual";

  constructor(repository?: ClasseProcessualRepository) {
    this.repository = repository ?? new ClasseProcessualRepository();
  }

  async list(query: ClasseProcessualQueryDto): Promise<unknown> {
    const paginationQuery = (query ?? {}) as Record<string, unknown>;
    const { page, pageSize } = parsePagination(paginationQuery);
    const filters = parseFilter<ClasseProcessual, ClasseProcessualFilterFields>(
      paginationQuery,
      CLASSE_PROCESSUAL_FILTER_MAPPINGS
    );

    return withSession(async (session) => {
      const baseQuery = this.repository.buildListQuery();
      const filteredQuery = applyFilter(baseQuery, this.repository.entityClass, filters);
      const paged = await filteredQuery.executePaged(session, { page, pageSize });
      return toPagedResponse(paged);
    });
  }

  async listOptions(query: ClasseProcessualQueryDto): Promise<ClasseProcessualOptionDto[]> {
    const paginationQuery = (query ?? {}) as Record<string, unknown>;
    const filters = parseFilter<ClasseProcessual, ClasseProcessualFilterFields>(
      paginationQuery,
      CLASSE_PROCESSUAL_FILTER_MAPPINGS
    );

    return withSession(async (session) => {
      let optionsQuery = this.repository.buildOptionsQuery();
      if (filters) {
        optionsQuery = applyFilter(optionsQuery, this.repository.entityClass, filters);
      }
      return optionsQuery.executePlain(session);
    });
  }

  async getOne(id: number): Promise<ClasseProcessualDto> {
    return withSession(async (session) => {
      const classeProcessual = await this.repository.findById(session, id);
      if (!classeProcessual) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      return classeProcessual as ClasseProcessualDto;
    });
  }

  async create(input: CreateClasseProcessualDto): Promise<ClasseProcessualDto> {
    return withSession(async (session) => {
      const classeProcessual = new ClasseProcessual();
      applyInput(classeProcessual, input as Partial<ClasseProcessual>, { partial: false });
      await session.persist(classeProcessual);
      await session.commit();
      return classeProcessual as ClasseProcessualDto;
    });
  }

  async replace(id: number, input: ReplaceClasseProcessualDto): Promise<ClasseProcessualDto> {
    return withSession(async (session) => {
      const classeProcessual = await this.repository.findById(session, id);
      if (!classeProcessual) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      applyInput(classeProcessual, input as Partial<ClasseProcessual>, { partial: false });
      await session.commit();
      return classeProcessual as ClasseProcessualDto;
    });
  }

  async update(id: number, input: UpdateClasseProcessualDto): Promise<ClasseProcessualDto> {
    return withSession(async (session) => {
      const classeProcessual = await this.repository.findById(session, id);
      if (!classeProcessual) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      applyInput(classeProcessual, input as Partial<ClasseProcessual>, { partial: true });
      await session.commit();
      return classeProcessual as ClasseProcessualDto;
    });
  }

  async remove(id: number): Promise<void> {
    return withSession(async (session) => {
      const classeProcessual = await this.repository.findById(session, id);
      if (!classeProcessual) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      await session.remove(classeProcessual);
      await session.commit();
    });
  }
}
