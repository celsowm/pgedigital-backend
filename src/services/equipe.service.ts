import {
  HttpError,
  applyInput,
  parseFilter,
  parsePagination
} from "adorn-api";
import { applyFilter, toPagedResponse } from "metal-orm";
import { withSession } from "../db/mssql";
import { Equipe } from "../entities/Equipe";
import type {
  CreateEquipeDto,
  EquipeOptionDto,
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

export class EquipeService {
  private readonly repository: EquipeRepository;
  private readonly entityName = "equipe";

  constructor(repository?: EquipeRepository) {
    this.repository = repository ?? new EquipeRepository();
  }

  async list(query: EquipeQueryDto): Promise<unknown> {
    const paginationQuery = (query ?? {}) as Record<string, unknown>;
    const { page, pageSize } = parsePagination(paginationQuery);
    const filters = parseFilter<Equipe, EquipeFilterFields>(
      paginationQuery,
      EQUIPE_FILTER_MAPPINGS
    );

    return withSession(async (session) => {
      const baseQuery = this.repository.buildListQuery();
      const filteredQuery = applyFilter(baseQuery, this.repository.entityClass, filters);
      const paged = await filteredQuery.executePaged(session, { page, pageSize });
      return toPagedResponse(paged);
    });
  }

  async listOptions(query: EquipeQueryDto): Promise<EquipeOptionDto[]> {
    const paginationQuery = (query ?? {}) as Record<string, unknown>;
    const filters = parseFilter<Equipe, EquipeFilterFields>(
      paginationQuery,
      EQUIPE_FILTER_MAPPINGS
    );

    return withSession(async (session) => {
      let optionsQuery = this.repository.buildOptionsQuery();
      if (filters) {
        optionsQuery = applyFilter(optionsQuery, this.repository.entityClass, filters);
      }
      return optionsQuery.executePlain(session);
    });
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
