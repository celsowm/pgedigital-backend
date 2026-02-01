import {
  HttpError,
  applyInput,
  parseFilter,
  parsePagination
} from "adorn-api";
import { applyFilter, toPagedResponse } from "metal-orm";
import { withSession } from "../db/mssql";
import { Especializada } from "../entities/Especializada";
import { Usuario } from "../entities/Usuario";
import type {
  CreateEspecializadaDto,
  EspecializadaOptionDto,
  EspecializadaQueryDto,
  EspecializadaWithResponsavelDto,
  ReplaceEspecializadaDto,
  UpdateEspecializadaDto
} from "../dtos/especializada/especializada.dtos";
import {
  EspecializadaRepository,
  ESPECIALIZADA_FILTER_MAPPINGS,
  RESPONSAVEL_FILTER_MAPPINGS,
  type EspecializadaFilterFields,
  type ResponsavelFilterFields
} from "../repositories/especializada.repository";

export class EspecializadaService {
  private readonly repository: EspecializadaRepository;
  private readonly entityName = "especializada";

  constructor(repository?: EspecializadaRepository) {
    this.repository = repository ?? new EspecializadaRepository();
  }

  async list(query: EspecializadaQueryDto): Promise<unknown> {
    const paginationQuery = (query ?? {}) as Record<string, unknown>;
    const responsavelFilters = parseFilter<Usuario, ResponsavelFilterFields>(
      paginationQuery,
      RESPONSAVEL_FILTER_MAPPINGS
    );
    const { page, pageSize } = parsePagination(paginationQuery);
    const filters = parseFilter<Especializada, EspecializadaFilterFields>(
      paginationQuery,
      ESPECIALIZADA_FILTER_MAPPINGS
    );

    return withSession(async (session) => {
      let queryBuilder = applyFilter(
        this.repository.buildListQuery(),
        this.repository.entityClass,
        filters
      );

      if (responsavelFilters) {
        queryBuilder = queryBuilder.whereHas("responsavel", (qb) =>
          applyFilter(qb, Usuario, responsavelFilters)
        );
      }

      const paged = await queryBuilder.executePaged(session, { page, pageSize });
      return toPagedResponse(paged);
    });
  }

  async listSiglas(): Promise<string[]> {
    return withSession((session) => this.repository.listSiglas(session));
  }

  async listOptions(query: EspecializadaQueryDto): Promise<EspecializadaOptionDto[]> {
    const paginationQuery = (query ?? {}) as Record<string, unknown>;
    const filters = parseFilter<Especializada, EspecializadaFilterFields>(
      paginationQuery,
      ESPECIALIZADA_FILTER_MAPPINGS
    );

    return withSession(async (session) => {
      let optionsQuery = this.repository.buildOptionsQuery();
      if (filters) {
        optionsQuery = applyFilter(optionsQuery, this.repository.entityClass, filters);
      }
      return optionsQuery.executePlain(session);
    });
  }

  async getOne(id: number): Promise<EspecializadaWithResponsavelDto> {
    return withSession(async (session) => {
      const especializada = await this.repository.getWithResponsavel(session, id);
      if (!especializada) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      return especializada as EspecializadaWithResponsavelDto;
    });
  }

  async create(input: CreateEspecializadaDto): Promise<EspecializadaWithResponsavelDto> {
    return withSession(async (session) => {
      const especializada = new Especializada();
      applyInput(especializada, input as Partial<Especializada>, { partial: false });
      await session.persist(especializada);
      await session.commit();

      const reloaded = await this.repository.getWithResponsavel(session, especializada.id);
      if (!reloaded) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      return reloaded as EspecializadaWithResponsavelDto;
    });
  }

  async replace(id: number, input: ReplaceEspecializadaDto): Promise<EspecializadaWithResponsavelDto> {
    return withSession(async (session) => {
      const especializada = await this.repository.findById(session, id);
      if (!especializada) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      applyInput(especializada, input as Partial<Especializada>, { partial: false });
      await session.commit();

      const reloaded = await this.repository.getWithResponsavel(session, id);
      if (!reloaded) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      return reloaded as EspecializadaWithResponsavelDto;
    });
  }

  async update(id: number, input: UpdateEspecializadaDto): Promise<EspecializadaWithResponsavelDto> {
    return withSession(async (session) => {
      const especializada = await this.repository.findById(session, id);
      if (!especializada) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      applyInput(especializada, input as Partial<Especializada>, { partial: true });
      await session.commit();

      const reloaded = await this.repository.getWithResponsavel(session, id);
      if (!reloaded) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      return reloaded as EspecializadaWithResponsavelDto;
    });
  }

  async remove(id: number): Promise<void> {
    return withSession(async (session) => {
      const especializada = await this.repository.findById(session, id);
      if (!especializada) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      await session.remove(especializada);
      await session.commit();
    });
  }
}
