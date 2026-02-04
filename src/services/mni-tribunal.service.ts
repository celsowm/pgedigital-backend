import { HttpError, applyInput } from "adorn-api";
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
import { BaseService, type ListConfig } from "./base.service";

const SORTABLE_COLUMNS = ["id", "sigla", "descricao", "identificador_cnj"] as const;

export class MniTribunalService extends BaseService<MniTribunal, MniTribunalFilterFields, MniTribunalQueryDto> {
  protected readonly repository: MniTribunalRepository;
  protected readonly listConfig: ListConfig<MniTribunal, MniTribunalFilterFields> = {
    filterMappings: MNI_TRIBUNAL_FILTER_MAPPINGS,
    sortableColumns: [...SORTABLE_COLUMNS],
    defaultSortBy: "id",
    defaultSortOrder: "ASC"
  };
  private readonly entityName = "MNI Tribunal";

  constructor(repository?: MniTribunalRepository) {
    super();
    this.repository = repository ?? new MniTribunalRepository();
  }

  override async listOptions(query: MniTribunalQueryDto): Promise<MniTribunalOptionDto[]> {
    return super.listOptions(query, "descricao");
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
