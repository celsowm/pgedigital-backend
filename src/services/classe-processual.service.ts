import { HttpError, applyInput } from "adorn-api";
import { withSession } from "../db/mssql";
import { ClasseProcessual } from "../entities/ClasseProcessual";
import type {
  ClasseProcessualDto,
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
import { BaseService, type ListConfig } from "./base.service";

const SORTABLE_COLUMNS = ["id", "nome", "situacao"] as const;

export class ClasseProcessualService extends BaseService<ClasseProcessual, ClasseProcessualFilterFields, ClasseProcessualQueryDto> {
  protected readonly repository: ClasseProcessualRepository;
  protected readonly listConfig: ListConfig<ClasseProcessual, ClasseProcessualFilterFields> = {
    filterMappings: CLASSE_PROCESSUAL_FILTER_MAPPINGS,
    sortableColumns: [...SORTABLE_COLUMNS],
    defaultSortBy: "id",
    defaultSortOrder: "ASC"
  };

  private readonly entityName = "classe processual";

  constructor(repository?: ClasseProcessualRepository) {
    super();
    this.repository = repository ?? new ClasseProcessualRepository();
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
