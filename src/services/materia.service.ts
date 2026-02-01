import {
  HttpError,
  applyInput,
  parseFilter,
  parsePagination
} from "adorn-api";
import { applyFilter, toPagedResponse } from "metal-orm";
import { withSession } from "../db/mssql";
import { Materia } from "../entities/Materia";
import type {
  CreateMateriaDto,
  MateriaDto,
  MateriaOptionDto,
  MateriaQueryDto,
  ReplaceMateriaDto,
  UpdateMateriaDto
} from "../dtos/materia/materia.dtos";
import {
  MateriaRepository,
  MATERIA_FILTER_MAPPINGS,
  type MateriaFilterFields
} from "../repositories/materia.repository";

export class MateriaService {
  private readonly repository: MateriaRepository;
  private readonly entityName = "matéria";

  constructor(repository?: MateriaRepository) {
    this.repository = repository ?? new MateriaRepository();
  }

  async list(query: MateriaQueryDto): Promise<unknown> {
    const paginationQuery = (query ?? {}) as Record<string, unknown>;
    const { page, pageSize } = parsePagination(paginationQuery);
    const filters = parseFilter<Materia, MateriaFilterFields>(
      paginationQuery,
      MATERIA_FILTER_MAPPINGS
    );

    return withSession(async (session) => {
      const baseQuery = this.repository.buildListQuery();
      const filteredQuery = applyFilter(baseQuery, this.repository.entityClass, filters);
      const paged = await filteredQuery.executePaged(session, { page, pageSize });
      return toPagedResponse(paged);
    });
  }

  async listOptions(query: MateriaQueryDto): Promise<MateriaOptionDto[]> {
    const paginationQuery = (query ?? {}) as Record<string, unknown>;
    const filters = parseFilter<Materia, MateriaFilterFields>(
      paginationQuery,
      MATERIA_FILTER_MAPPINGS
    );

    return withSession(async (session) => {
      let optionsQuery = this.repository.buildOptionsQuery();
      if (filters) {
        optionsQuery = applyFilter(optionsQuery, this.repository.entityClass, filters);
      }
      return optionsQuery.executePlain(session);
    });
  }

  async getOne(id: number): Promise<MateriaDto> {
    return withSession(async (session) => {
      const materia = await this.repository.findById(session, id);
      if (!materia) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      return materia as MateriaDto;
    });
  }

  async create(input: CreateMateriaDto): Promise<MateriaDto> {
    return withSession(async (session) => {
      const materia = new Materia();
      applyInput(materia, input as Partial<Materia>, { partial: false });
      await session.persist(materia);
      await session.commit();
      return materia as MateriaDto;
    });
  }

  async replace(id: number, input: ReplaceMateriaDto): Promise<MateriaDto> {
    return withSession(async (session) => {
      const materia = await this.repository.findById(session, id);
      if (!materia) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      applyInput(materia, input as Partial<Materia>, { partial: false });
      await session.commit();
      return materia as MateriaDto;
    });
  }

  async update(id: number, input: UpdateMateriaDto): Promise<MateriaDto> {
    return withSession(async (session) => {
      const materia = await this.repository.findById(session, id);
      if (!materia) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      applyInput(materia, input as Partial<Materia>, { partial: true });
      await session.commit();
      return materia as MateriaDto;
    });
  }

  async remove(id: number): Promise<void> {
    return withSession(async (session) => {
      const materia = await this.repository.findById(session, id);
      if (!materia) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      await session.remove(materia);
      await session.commit();
    });
  }
}
