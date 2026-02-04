import { HttpError, applyInput } from "adorn-api";
import { withSession } from "../db/mssql";
import { Equipe } from "../entities/Equipe";
import type {
  CreateEquipeDto,
  EquipeQueryDto,
  EquipeWithEspecializadaDto,
  ReplaceEquipeDto,
  UpdateEquipeDto
} from "../dtos/equipe/equipe.dtos";
import {
  EquipeRepository,
  EQUIPE_FILTER_MAPPINGS,
  type EquipeFilterFields
} from "../repositories/equipe.repository";
import { BaseService, type ListConfig } from "./base.service";

const SORTABLE_COLUMNS = ["id", "nome", "especializada_id"] as const;

export class EquipeService extends BaseService<Equipe, EquipeFilterFields, EquipeQueryDto> {
  protected readonly repository: EquipeRepository;
  protected readonly listConfig: ListConfig<Equipe, EquipeFilterFields> = {
    filterMappings: EQUIPE_FILTER_MAPPINGS,
    sortableColumns: [...SORTABLE_COLUMNS],
    defaultSortBy: "id",
    defaultSortOrder: "ASC"
  };
  private readonly entityName = "equipe";

  constructor(repository?: EquipeRepository) {
    super();
    this.repository = repository ?? new EquipeRepository();
  }
  async getOne(id: number): Promise<EquipeWithEspecializadaDto> {
    return withSession(async (session) => {
      const equipe = await this.repository.getWithEspecializada(session, id);
      if (!equipe) {
        throw new HttpError(404, "Equipe not found.");
      }
      return equipe as EquipeWithEspecializadaDto;
    });
  }

  async create(input: CreateEquipeDto): Promise<EquipeWithEspecializadaDto> {
    return withSession(async (session) => {
      const equipe = new Equipe();
      applyInput(equipe, input as Partial<Equipe>, { partial: false });
      await session.persist(equipe);
      await session.commit();

      const reloaded = await this.repository.getWithEspecializada(session, equipe.id);
      if (!reloaded) {
        throw new HttpError(404, "Equipe not found.");
      }
      return reloaded as EquipeWithEspecializadaDto;
    });
  }

  async replace(id: number, input: ReplaceEquipeDto): Promise<EquipeWithEspecializadaDto> {
    return withSession(async (session) => {
      const equipe = await this.repository.findById(session, id);
      if (!equipe) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      applyInput(equipe, input as Partial<Equipe>, { partial: false });
      await session.commit();

      const reloaded = await this.repository.getWithEspecializada(session, id);
      if (!reloaded) {
        throw new HttpError(404, "Equipe not found.");
      }
      return reloaded as EquipeWithEspecializadaDto;
    });
  }

  async update(id: number, input: UpdateEquipeDto): Promise<EquipeWithEspecializadaDto> {
    return withSession(async (session) => {
      const equipe = await this.repository.findById(session, id);
      if (!equipe) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      applyInput(equipe, input as Partial<Equipe>, { partial: true });
      await session.commit();

      const reloaded = await this.repository.getWithEspecializada(session, id);
      if (!reloaded) {
        throw new HttpError(404, "Equipe not found.");
      }
      return reloaded as EquipeWithEspecializadaDto;
    });
  }

  async remove(id: number): Promise<void> {
    return withSession(async (session) => {
      const equipe = await this.repository.findById(session, id);
      if (!equipe) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      await session.remove(equipe);
      await session.commit();
    });
  }
}
