import {
  HttpError,
  applyInput,
  parseFilter,
  parsePagination
} from "adorn-api";
import { applyFilter, toPagedResponse } from "metal-orm";
import { withSession } from "../db/mssql";
import { Classificacao } from "../entities/Classificacao";
import type {
  ClassificacaoDto,
  ClassificacaoOptionDto,
  ClassificacaoQueryDto,
  CreateClassificacaoDto,
  ReplaceClassificacaoDto,
  UpdateClassificacaoDto
} from "../dtos/classificacao/classificacao.dtos";
import {
  ClassificacaoRepository,
  CLASSIFICACAO_FILTER_MAPPINGS,
  type ClassificacaoFilterFields
} from "../repositories/classificacao.repository";

export class ClassificacaoService {
  private readonly repository: ClassificacaoRepository;
  private readonly entityName = "classificação";

  constructor(repository?: ClassificacaoRepository) {
    this.repository = repository ?? new ClassificacaoRepository();
  }

  async list(query: ClassificacaoQueryDto): Promise<unknown> {
    const paginationQuery = (query ?? {}) as Record<string, unknown>;
    const { page, pageSize } = parsePagination(paginationQuery);
    const filters = parseFilter<Classificacao, ClassificacaoFilterFields>(
      paginationQuery,
      CLASSIFICACAO_FILTER_MAPPINGS
    );

    return withSession(async (session) => {
      const baseQuery = this.repository.buildListQuery();
      const filteredQuery = applyFilter(baseQuery, this.repository.entityClass, filters);
      const paged = await filteredQuery.executePaged(session, { page, pageSize });
      return toPagedResponse(paged);
    });
  }

  async listOptions(query: ClassificacaoQueryDto): Promise<ClassificacaoOptionDto[]> {
    const paginationQuery = (query ?? {}) as Record<string, unknown>;
    const filters = parseFilter<Classificacao, ClassificacaoFilterFields>(
      paginationQuery,
      CLASSIFICACAO_FILTER_MAPPINGS
    );

    return withSession(async (session) => {
      let optionsQuery = this.repository.buildOptionsQuery();
      if (filters) {
        optionsQuery = applyFilter(optionsQuery, this.repository.entityClass, filters);
      }
      return optionsQuery.executePlain(session);
    });
  }

  async getOne(id: number): Promise<ClassificacaoDto> {
    return withSession(async (session) => {
      const classificacao = await this.repository.findById(session, id);
      if (!classificacao) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      return classificacao as ClassificacaoDto;
    });
  }

  async create(input: CreateClassificacaoDto): Promise<ClassificacaoDto> {
    return withSession(async (session) => {
      const classificacao = new Classificacao();
      applyInput(classificacao, input as Partial<Classificacao>, { partial: false });
      await session.persist(classificacao);
      await session.commit();
      return classificacao as ClassificacaoDto;
    });
  }

  async replace(id: number, input: ReplaceClassificacaoDto): Promise<ClassificacaoDto> {
    return withSession(async (session) => {
      const classificacao = await this.repository.findById(session, id);
      if (!classificacao) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      applyInput(classificacao, input as Partial<Classificacao>, { partial: false });
      await session.commit();
      return classificacao as ClassificacaoDto;
    });
  }

  async update(id: number, input: UpdateClassificacaoDto): Promise<ClassificacaoDto> {
    return withSession(async (session) => {
      const classificacao = await this.repository.findById(session, id);
      if (!classificacao) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      applyInput(classificacao, input as Partial<Classificacao>, { partial: true });
      await session.commit();
      return classificacao as ClassificacaoDto;
    });
  }

  async remove(id: number): Promise<void> {
    return withSession(async (session) => {
      const classificacao = await this.repository.findById(session, id);
      if (!classificacao) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      await session.remove(classificacao);
      await session.commit();
    });
  }
}
