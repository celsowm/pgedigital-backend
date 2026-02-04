import { HttpError, applyInput } from "adorn-api";
import { withSession } from "../db/mssql";
import { Acervo } from "../entities/Acervo";
import type {
  AcervoDetailDto,
  AcervoQueryDto,
  CreateAcervoDto,
  ReplaceAcervoDto,
  UpdateAcervoDto
} from "../dtos/acervo/acervo.dtos";
import {
  AcervoRepository,
  ACERVO_FILTER_MAPPINGS,
  type AcervoFilterFields
} from "../repositories/acervo.repository";
import { BaseService, type ListConfig } from "./base.service";

const SORTABLE_COLUMNS = ["id", "nome", "ativo", "created", "modified"] as const;

export class AcervoService extends BaseService<Acervo, AcervoFilterFields, AcervoQueryDto> {
  protected readonly repository: AcervoRepository;
  protected readonly listConfig: ListConfig<Acervo, AcervoFilterFields> = {
    filterMappings: ACERVO_FILTER_MAPPINGS,
    sortableColumns: [...SORTABLE_COLUMNS],
    defaultSortBy: "id",
    defaultSortOrder: "ASC"
  };

  private readonly entityName = "acervo";

  constructor(repository?: AcervoRepository) {
    super();
    this.repository = repository ?? new AcervoRepository();
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
