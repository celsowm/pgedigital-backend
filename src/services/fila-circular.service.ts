import { HttpError, applyInput } from "adorn-api";
import { withSession } from "../db/mssql";
import { FilaCircular } from "../entities/FilaCircular";
import type {
  CreateFilaCircularDto,
  FilaCircularDto,
  FilaCircularOptionDto,
  FilaCircularQueryDto,
  ReplaceFilaCircularDto,
  UpdateFilaCircularDto
} from "../dtos/fila-circular/fila-circular.dtos";
import {
  FilaCircularRepository,
  FILA_CIRCULAR_FILTER_MAPPINGS,
  type FilaCircularFilterFields
} from "../repositories/fila-circular.repository";
import { BaseService, type ListConfig } from "./base.service";

const SORTABLE_COLUMNS = ["id", "ultimo_elemento"] as const;

export class FilaCircularService extends BaseService<FilaCircular, FilaCircularFilterFields, FilaCircularQueryDto> {
  protected readonly repository: FilaCircularRepository;
  protected readonly listConfig: ListConfig<FilaCircular, FilaCircularFilterFields> = {
    filterMappings: FILA_CIRCULAR_FILTER_MAPPINGS,
    sortableColumns: [...SORTABLE_COLUMNS],
    defaultSortBy: "id",
    defaultSortOrder: "ASC"
  };
  private readonly entityName = "fila circular";

  constructor(repository?: FilaCircularRepository) {
    super();
    this.repository = repository ?? new FilaCircularRepository();
  }

  override async listOptions(query: FilaCircularQueryDto): Promise<FilaCircularOptionDto[]> {
    return super.listOptions(query, "ultimo_elemento");
  }

  async getOne(id: number): Promise<FilaCircularDto> {
    return withSession(async (session) => {
      const filaCircular = await this.repository.findById(session, id);
      if (!filaCircular) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      return filaCircular as FilaCircularDto;
    });
  }

  async create(input: CreateFilaCircularDto): Promise<FilaCircularDto> {
    return withSession(async (session) => {
      const filaCircular = new FilaCircular();
      applyInput(filaCircular, input as Partial<FilaCircular>, { partial: false });
      await session.persist(filaCircular);
      await session.commit();
      return filaCircular as FilaCircularDto;
    });
  }

  async replace(id: number, input: ReplaceFilaCircularDto): Promise<FilaCircularDto> {
    return withSession(async (session) => {
      const filaCircular = await this.repository.findById(session, id);
      if (!filaCircular) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      applyInput(filaCircular, input as Partial<FilaCircular>, { partial: false });
      await session.commit();
      return filaCircular as FilaCircularDto;
    });
  }

  async update(id: number, input: UpdateFilaCircularDto): Promise<FilaCircularDto> {
    return withSession(async (session) => {
      const filaCircular = await this.repository.findById(session, id);
      if (!filaCircular) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      applyInput(filaCircular, input as Partial<FilaCircular>, { partial: true });
      await session.commit();
      return filaCircular as FilaCircularDto;
    });
  }

  async remove(id: number): Promise<void> {
    return withSession(async (session) => {
      const filaCircular = await this.repository.findById(session, id);
      if (!filaCircular) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      await session.remove(filaCircular);
      await session.commit();
    });
  }
}
