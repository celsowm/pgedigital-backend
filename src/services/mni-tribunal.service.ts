import {
  HttpError,
  applyInput,
  parseFilter,
  parsePagination
} from "adorn-api";
import { applyFilter, toPagedResponse } from "metal-orm";
import { withSession } from "../db/mssql";
import { MniTribunal } from "../entities/MniTribunal";
import type {
  CreateMniTribunalDto,
  MniTribunalDto,
  MniTribunalOptionDto,
  MniTribunalQueryDto,
  ReplaceMniTribunalDto,
  UpdateMniTribunalDto
} from "../dtos/mni-tribunal/mni-tribunal.dtos";
import {
  MniTribunalRepository,
  MNI_TRIBUNAL_FILTER_MAPPINGS,
  type MniTribunalFilterFields
} from "../repositories/mni-tribunal.repository";

export class MniTribunalService {
  private readonly repository: MniTribunalRepository;
  private readonly entityName = "MNI Tribunal";

  constructor(repository?: MniTribunalRepository) {
    this.repository = repository ?? new MniTribunalRepository();
  }

  async list(query: MniTribunalQueryDto): Promise<unknown> {
    const paginationQuery = (query ?? {}) as Record<string, unknown>;
    const { page, pageSize } = parsePagination(paginationQuery);
    const filters = parseFilter<MniTribunal, MniTribunalFilterFields>(
      paginationQuery,
      MNI_TRIBUNAL_FILTER_MAPPINGS
    );

    return withSession(async (session) => {
      const baseQuery = this.repository.buildListQuery();
      const filteredQuery = applyFilter(baseQuery, this.repository.entityClass, filters);
      const paged = await filteredQuery.executePaged(session, { page, pageSize });
      return toPagedResponse(paged);
    });
  }

  async listOptions(query: MniTribunalQueryDto): Promise<MniTribunalOptionDto[]> {
    const paginationQuery = (query ?? {}) as Record<string, unknown>;
    const filters = parseFilter<MniTribunal, MniTribunalFilterFields>(
      paginationQuery,
      MNI_TRIBUNAL_FILTER_MAPPINGS
    );

    return withSession(async (session) => {
      let optionsQuery = this.repository.buildOptionsQuery("descricao");
      if (filters) {
        optionsQuery = applyFilter(optionsQuery, this.repository.entityClass, filters);
      }
      return optionsQuery.executePlain(session);
    });
  }

  async getOne(id: number): Promise<MniTribunalDto> {
    return withSession(async (session) => {
      const mniTribunal = await this.repository.findById(session, id);
      if (!mniTribunal) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      return mniTribunal as MniTribunalDto;
    });
  }

  async create(input: CreateMniTribunalDto): Promise<MniTribunalDto> {
    return withSession(async (session) => {
      const mniTribunal = new MniTribunal();
      applyInput(mniTribunal, input as Partial<MniTribunal>, { partial: false });
      await session.persist(mniTribunal);
      await session.commit();
      return mniTribunal as MniTribunalDto;
    });
  }

  async replace(id: number, input: ReplaceMniTribunalDto): Promise<MniTribunalDto> {
    return withSession(async (session) => {
      const mniTribunal = await this.repository.findById(session, id);
      if (!mniTribunal) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      applyInput(mniTribunal, input as Partial<MniTribunal>, { partial: false });
      await session.commit();
      return mniTribunal as MniTribunalDto;
    });
  }

  async update(id: number, input: UpdateMniTribunalDto): Promise<MniTribunalDto> {
    return withSession(async (session) => {
      const mniTribunal = await this.repository.findById(session, id);
      if (!mniTribunal) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      applyInput(mniTribunal, input as Partial<MniTribunal>, { partial: true });
      await session.commit();
      return mniTribunal as MniTribunalDto;
    });
  }

  async remove(id: number): Promise<void> {
    return withSession(async (session) => {
      const mniTribunal = await this.repository.findById(session, id);
      if (!mniTribunal) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      await session.remove(mniTribunal);
      await session.commit();
    });
  }
}
