import { HttpError } from "adorn-api";
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
  ACERVO_FILTER_MAPPINGS
} from "../repositories/acervo.repository";
import { BaseService, type ListConfig } from "./base.service";

const SORTABLE_COLUMNS = ["id", "nome", "procurador_titular_id"] as const;

export class AcervoService extends BaseService<
  Acervo,
  AcervoQueryDto,
  AcervoDetailDto,
  CreateAcervoDto,
  ReplaceAcervoDto,
  UpdateAcervoDto
> {
  protected readonly repository: AcervoRepository;
  protected readonly listConfig: ListConfig<Acervo> = {
    filterMappings: ACERVO_FILTER_MAPPINGS,
    sortableColumns: [...SORTABLE_COLUMNS],
    defaultSortBy: "id",
    defaultSortOrder: "ASC"
  };

  protected readonly entityName = "acervo";

  constructor(repository?: AcervoRepository) {
    super();
    this.repository = repository ?? new AcervoRepository();
  }

  override async create(input: CreateAcervoDto): Promise<AcervoDetailDto> {
    return withSession(async (session) => {
      const acervo = await session.saveGraph(Acervo, input as Record<string, unknown>, { transactional: false });
      await session.commit();
      return (await this.repository.getDetail(session, acervo.id)) as AcervoDetailDto;
    });
  }

  override async replace(id: number, input: ReplaceAcervoDto): Promise<AcervoDetailDto> {
    return withSession(async (session) => {
      const result = await session.updateGraph(Acervo, {
        id,
        ...input
      } as Record<string, unknown>, { pruneMissing: true, transactional: false });
      if (!result) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      await session.commit();
      return (await this.repository.getDetail(session, id)) as AcervoDetailDto;
    });
  }

  override async update(id: number, input: UpdateAcervoDto): Promise<AcervoDetailDto> {
    return withSession(async (session) => {
      const result = await session.patchGraph(Acervo, {
        id,
        ...input
      } as Record<string, unknown>, { transactional: false });
      if (!result) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      await session.commit();
      return (await this.repository.getDetail(session, id)) as AcervoDetailDto;
    });
  }
}
