import { HttpError, applyInput } from "adorn-api";
import { withSession } from "../db/mssql";
import { Classificacao } from "../entities/Classificacao";
import type {
  ClassificacaoDto,
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
import { BaseService, type ListConfig } from "./base.service";

const SORTABLE_COLUMNS = ["id", "nome", "peso"] as const;

export class ClassificacaoService extends BaseService<Classificacao, ClassificacaoFilterFields, ClassificacaoQueryDto> {
  protected readonly repository: ClassificacaoRepository;
  protected readonly listConfig: ListConfig<Classificacao, ClassificacaoFilterFields> = {
    filterMappings: CLASSIFICACAO_FILTER_MAPPINGS,
    sortableColumns: [...SORTABLE_COLUMNS],
    defaultSortBy: "id",
    defaultSortOrder: "ASC"
  };

  private readonly entityName = "classificação";

  constructor(repository?: ClassificacaoRepository) {
    super();
    this.repository = repository ?? new ClassificacaoRepository();
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
