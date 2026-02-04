import {
  HttpError,
  applyInput,
  parseFilter,
  parsePagination
} from "adorn-api";
import { applyFilter, toPagedResponse } from "metal-orm";
import { withSession } from "../db/mssql";
import { Acervo } from "../entities/Acervo";
import type {
  AcervoDetailDto,
  AcervoQueryDto,
  AcervoOptionDto,
  CreateAcervoDto,
  ReplaceAcervoDto,
  UpdateAcervoDto
} from "../dtos/acervo/acervo.dtos";
import {
  AcervoRepository,
  ACERVO_FILTER_MAPPINGS,
  type AcervoFilterFields
} from "../repositories/acervo.repository";

export class AcervoService {
  private readonly repository: AcervoRepository;
  private readonly entityName = "acervo";

  constructor(repository?: AcervoRepository) {
    this.repository = repository ?? new AcervoRepository();
  }

  async list(query: AcervoQueryDto): Promise<unknown> {
    const paginationQuery = (query ?? {}) as Record<string, unknown>;
    const { page, pageSize } = parsePagination(paginationQuery);
    const filters = parseFilter<Acervo, AcervoFilterFields>(
      paginationQuery,
      ACERVO_FILTER_MAPPINGS
    );

    return withSession(async (session) => {
      const baseQuery = this.repository.buildListQuery();
      const filteredQuery = applyFilter(baseQuery, this.repository.entityClass, filters);
      const paged = await filteredQuery.executePaged(session, { page, pageSize });
      return toPagedResponse(paged);
    });
  }

  async listOptions(query: AcervoQueryDto): Promise<AcervoOptionDto[]> {
    const paginationQuery = (query ?? {}) as Record<string, unknown>;
    const filters = parseFilter<Acervo, AcervoFilterFields>(
      paginationQuery,
      ACERVO_FILTER_MAPPINGS
    );

    return withSession(async (session) => {
      let optionsQuery = this.repository.buildOptionsQuery();
      if (filters) {
        optionsQuery = applyFilter(optionsQuery, this.repository.entityClass, filters);
      }
      return optionsQuery.executePlain(session);
    });
  }

  async getOne(id: number): Promise<AcervoDetailDto> {
    return withSession(async (session) => {
      const acervo = await this.repository.getDetail(session, id);
      if (!acervo) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      return acervo;
    });
  }

  async create(input: CreateAcervoDto): Promise<AcervoDetailDto> {
    return withSession(async (session) => {
      const acervo = new Acervo();
      applyInput(acervo, input as Partial<Acervo>, { partial: false });
      await session.persist(acervo);
      await session.commit();

      const detail = await this.repository.getDetail(session, acervo.id);
      if (!detail) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      return detail;
    });
  }

  async replace(id: number, input: ReplaceAcervoDto): Promise<AcervoDetailDto> {
    return withSession(async (session) => {
      const acervo = await this.repository.findById(session, id);
      if (!acervo) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      applyInput(acervo, input as Partial<Acervo>, { partial: false });
      await session.commit();

      const detail = await this.repository.getDetail(session, id);
      if (!detail) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      return detail;
    });
  }

  async update(id: number, input: UpdateAcervoDto): Promise<AcervoDetailDto> {
    return withSession(async (session) => {
      const acervo = await this.repository.findById(session, id);
      if (!acervo) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      applyInput(acervo, input as Partial<Acervo>, { partial: true });
      await session.commit();

      const detail = await this.repository.getDetail(session, id);
      if (!detail) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      return detail;
    });
  }

  async remove(id: number): Promise<void> {
    return withSession(async (session) => {
      const acervo = await this.repository.findById(session, id);
      if (!acervo) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      await session.remove(acervo);
      await session.commit();
    });
  }
}
