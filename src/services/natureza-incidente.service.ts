import {
  HttpError,
  applyInput,
  parseFilter,
  parsePagination
} from "adorn-api";
import { applyFilter, toPagedResponse } from "metal-orm";
import { withSession } from "../db/mssql";
import { NaturezaIncidente } from "../entities/NaturezaIncidente";
import type {
  CreateNaturezaIncidenteDto,
  NaturezaIncidenteDto,
  NaturezaIncidenteOptionDto,
  NaturezaIncidenteQueryDto,
  ReplaceNaturezaIncidenteDto,
  UpdateNaturezaIncidenteDto
} from "../dtos/natureza-incidente/natureza-incidente.dtos";
import {
  NaturezaIncidenteRepository,
  NATUREZA_INCIDENTE_FILTER_MAPPINGS,
  type NaturezaIncidenteFilterFields
} from "../repositories/natureza-incidente.repository";

export class NaturezaIncidenteService {
  private readonly repository: NaturezaIncidenteRepository;
  private readonly entityName = "natureza incidente";

  constructor(repository?: NaturezaIncidenteRepository) {
    this.repository = repository ?? new NaturezaIncidenteRepository();
  }

  async list(query: NaturezaIncidenteQueryDto): Promise<unknown> {
    const paginationQuery = (query ?? {}) as Record<string, unknown>;
    const { page, pageSize } = parsePagination(paginationQuery);
    const filters = parseFilter<NaturezaIncidente, NaturezaIncidenteFilterFields>(
      paginationQuery,
      NATUREZA_INCIDENTE_FILTER_MAPPINGS
    );

    return withSession(async (session) => {
      const baseQuery = this.repository.buildListQuery();
      const filteredQuery = applyFilter(baseQuery, this.repository.entityClass, filters);
      const paged = await filteredQuery.executePaged(session, { page, pageSize });
      return toPagedResponse(paged);
    });
  }

  async listOptions(query: NaturezaIncidenteQueryDto): Promise<NaturezaIncidenteOptionDto[]> {
    const paginationQuery = (query ?? {}) as Record<string, unknown>;
    const filters = parseFilter<NaturezaIncidente, NaturezaIncidenteFilterFields>(
      paginationQuery,
      NATUREZA_INCIDENTE_FILTER_MAPPINGS
    );

    return withSession(async (session) => {
      let optionsQuery = this.repository.buildOptionsQuery();
      if (filters) {
        optionsQuery = applyFilter(optionsQuery, this.repository.entityClass, filters);
      }
      return optionsQuery.executePlain(session);
    });
  }

  async getOne(id: number): Promise<NaturezaIncidenteDto> {
    return withSession(async (session) => {
      const naturezaIncidente = await this.repository.findById(session, id);
      if (!naturezaIncidente) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      return naturezaIncidente as NaturezaIncidenteDto;
    });
  }

  async create(input: CreateNaturezaIncidenteDto): Promise<NaturezaIncidenteDto> {
    return withSession(async (session) => {
      const naturezaIncidente = new NaturezaIncidente();
      applyInput(naturezaIncidente, input as Partial<NaturezaIncidente>, { partial: false });
      await session.persist(naturezaIncidente);
      await session.commit();
      return naturezaIncidente as NaturezaIncidenteDto;
    });
  }

  async replace(id: number, input: ReplaceNaturezaIncidenteDto): Promise<NaturezaIncidenteDto> {
    return withSession(async (session) => {
      const naturezaIncidente = await this.repository.findById(session, id);
      if (!naturezaIncidente) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      applyInput(naturezaIncidente, input as Partial<NaturezaIncidente>, { partial: false });
      await session.commit();
      return naturezaIncidente as NaturezaIncidenteDto;
    });
  }

  async update(id: number, input: UpdateNaturezaIncidenteDto): Promise<NaturezaIncidenteDto> {
    return withSession(async (session) => {
      const naturezaIncidente = await this.repository.findById(session, id);
      if (!naturezaIncidente) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      applyInput(naturezaIncidente, input as Partial<NaturezaIncidente>, { partial: true });
      await session.commit();
      return naturezaIncidente as NaturezaIncidenteDto;
    });
  }

  async remove(id: number): Promise<void> {
    return withSession(async (session) => {
      const naturezaIncidente = await this.repository.findById(session, id);
      if (!naturezaIncidente) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      await session.remove(naturezaIncidente);
      await session.commit();
    });
  }
}
