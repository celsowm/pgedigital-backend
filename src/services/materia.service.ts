import { HttpError, applyInput } from "adorn-api";
import { withSession } from "../db/mssql";
import { Materia } from "../entities/Materia";
import type {
  CreateMateriaDto,
  MateriaDto,
  MateriaQueryDto,
  ReplaceMateriaDto,
  UpdateMateriaDto
} from "../dtos/materia/materia.dtos";
import {
  MateriaRepository,
  MATERIA_FILTER_MAPPINGS,
  type MateriaFilterFields
} from "../repositories/materia.repository";
import { BaseService, type ListConfig } from "./base.service";

const SORTABLE_COLUMNS = ["id", "nome"] as const;

export class MateriaService extends BaseService<Materia, MateriaQueryDto> {
  protected readonly repository: MateriaRepository;
  protected readonly listConfig: ListConfig<Materia> = {
    filterMappings: MATERIA_FILTER_MAPPINGS,
    sortableColumns: [...SORTABLE_COLUMNS],
    defaultSortBy: "id",
    defaultSortOrder: "ASC"
  };
  private readonly entityName = "matéria";

  constructor(repository?: MateriaRepository) {
    super();
    this.repository = repository ?? new MateriaRepository();
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
