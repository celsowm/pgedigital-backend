import { HttpError, applyInput } from "adorn-api";
import { withSession } from "../db/mssql";
import { Feriado } from "../entities/Feriado";
import type {
  CreateFeriadoDto,
  FeriadoDto,
  FeriadoQueryDto,
  ReplaceFeriadoDto,
  UpdateFeriadoDto
} from "../dtos/feriado/feriado.dtos";
import {
  FeriadoRepository,
  FERIADO_FILTER_MAPPINGS
} from "../repositories/feriado.repository";
import { BaseService, type ListConfig } from "./base.service";

const SORTABLE_COLUMNS = ["id", "data_inicio", "data_fim", "descricao"] as const;

export class FeriadoService extends BaseService<
  Feriado,
  FeriadoQueryDto,
  FeriadoDto,
  CreateFeriadoDto,
  ReplaceFeriadoDto,
  UpdateFeriadoDto
> {
  protected readonly repository: FeriadoRepository;
  protected readonly listConfig: ListConfig<Feriado> = {
    filterMappings: FERIADO_FILTER_MAPPINGS,
    sortableColumns: [...SORTABLE_COLUMNS],
    defaultSortBy: "id",
    defaultSortOrder: "ASC"
  };
  protected readonly entityName = "feriado";

  constructor(repository?: FeriadoRepository) {
    super();
    this.repository = repository ?? new FeriadoRepository();
  }

  private validateDates(input: { data_inicio?: Date | string; data_fim?: Date | string }): void {
    if (input.data_inicio && input.data_fim) {
      const inicio = new Date(input.data_inicio);
      const fim = new Date(input.data_fim);
      if (fim < inicio) {
        throw new HttpError(400, "Data fim não pode ser menor que data início.");
      }
    }
  }

  private applyDefaultDataFim(input: Record<string, unknown>): void {
    if (input.data_inicio && !input.data_fim) {
      input.data_fim = input.data_inicio;
    }
  }

  override async create(input: CreateFeriadoDto): Promise<FeriadoDto> {
    const mutableInput = { ...input } as Record<string, unknown>;
    this.applyDefaultDataFim(mutableInput);
    this.validateDates(mutableInput as { data_inicio?: Date; data_fim?: Date });
    return super.create(mutableInput as CreateFeriadoDto);
  }

  override async replace(id: number, input: ReplaceFeriadoDto): Promise<FeriadoDto> {
    const mutableInput = { ...input } as Record<string, unknown>;
    this.applyDefaultDataFim(mutableInput);
    this.validateDates(mutableInput as { data_inicio?: Date; data_fim?: Date });
    return super.replace(id, mutableInput as ReplaceFeriadoDto);
  }

  override async update(id: number, input: UpdateFeriadoDto): Promise<FeriadoDto> {
    this.validateDates(input as { data_inicio?: Date; data_fim?: Date });

    return withSession(async (session) => {
      const feriado = await this.repository.findById(session, id);
      if (!feriado) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }

      const mutableInput = { ...input } as Record<string, unknown>;
      if (mutableInput.data_inicio && !mutableInput.data_fim && !feriado.data_fim) {
        mutableInput.data_fim = mutableInput.data_inicio;
      }

      applyInput(feriado, mutableInput as Partial<Feriado>, { partial: true });

      if (feriado.data_fim && feriado.data_inicio && feriado.data_fim < feriado.data_inicio) {
        throw new HttpError(400, "Data fim não pode ser menor que data início.");
      }

      await session.commit();

      const detail = await this.repository.getDetail(session, id);
      if (!detail) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      return detail as FeriadoDto;
    });
  }
}
