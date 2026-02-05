import { HttpError, applyInput } from "adorn-api";
import { withSession } from "../db/mssql";
import { NaturezaIncidente } from "../entities/NaturezaIncidente";
import type {
  CreateNaturezaIncidenteDto,
  NaturezaIncidenteDto,
  NaturezaIncidenteQueryDto,
  ReplaceNaturezaIncidenteDto,
  UpdateNaturezaIncidenteDto
} from "../dtos/natureza-incidente/natureza-incidente.dtos";
import {
  NaturezaIncidenteRepository,
  NATUREZA_INCIDENTE_FILTER_MAPPINGS,
  type NaturezaIncidenteFilterFields
} from "../repositories/natureza-incidente.repository";
import { BaseService, type ListConfig } from "./base.service";

const SORTABLE_COLUMNS = ["id", "nome"] as const;

export class NaturezaIncidenteService extends BaseService<NaturezaIncidente, NaturezaIncidenteQueryDto> {
  protected readonly repository: NaturezaIncidenteRepository;
  protected readonly listConfig: ListConfig<NaturezaIncidente> = {
    filterMappings: NATUREZA_INCIDENTE_FILTER_MAPPINGS,
    sortableColumns: [...SORTABLE_COLUMNS],
    defaultSortBy: "id",
    defaultSortOrder: "ASC"
  };
  private readonly entityName = "natureza incidente";

  constructor(repository?: NaturezaIncidenteRepository) {
    super();
    this.repository = repository ?? new NaturezaIncidenteRepository();
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
