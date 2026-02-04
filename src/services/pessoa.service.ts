import { HttpError, applyInput } from "adorn-api";
import { withSession } from "../db/mssql";
import { Pessoa } from "../entities/Pessoa";
import type {
  CreatePessoaDto,
  PessoaDto,
  PessoaQueryDto,
  ReplacePessoaDto,
  UpdatePessoaDto
} from "../dtos/pessoa/pessoa.dtos";
import {
  PessoaRepository,
  PESSOA_FILTER_MAPPINGS,
  type PessoaFilterFields
} from "../repositories/pessoa.repository";
import { BaseService, type ListConfig } from "./base.service";

const SORTABLE_COLUMNS = ["id", "nome", "numero_documento_principal", "tipo_pessoa"] as const;

export class PessoaService extends BaseService<Pessoa, PessoaFilterFields, PessoaQueryDto> {
  protected readonly repository: PessoaRepository;
  protected readonly listConfig: ListConfig<Pessoa, PessoaFilterFields> = {
    filterMappings: PESSOA_FILTER_MAPPINGS,
    sortableColumns: [...SORTABLE_COLUMNS],
    defaultSortBy: "id",
    defaultSortOrder: "ASC"
  };
  private readonly entityName = "pessoa";

  constructor(repository?: PessoaRepository) {
    super();
    this.repository = repository ?? new PessoaRepository();
  }

  async getOne(id: number): Promise<PessoaDto> {
    return withSession(async (session) => {
      const pessoa = await this.repository.findById(session, id);
      if (!pessoa) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      return pessoa as PessoaDto;
    });
  }

  async create(input: CreatePessoaDto): Promise<PessoaDto> {
    return withSession(async (session) => {
      const pessoa = new Pessoa();
      applyInput(pessoa, input as Partial<Pessoa>, { partial: false });
      await session.persist(pessoa);
      await session.commit();
      return pessoa as PessoaDto;
    });
  }

  async replace(id: number, input: ReplacePessoaDto): Promise<PessoaDto> {
    return withSession(async (session) => {
      const pessoa = await this.repository.findById(session, id);
      if (!pessoa) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      applyInput(pessoa, input as Partial<Pessoa>, { partial: false });
      await session.commit();
      return pessoa as PessoaDto;
    });
  }

  async update(id: number, input: UpdatePessoaDto): Promise<PessoaDto> {
    return withSession(async (session) => {
      const pessoa = await this.repository.findById(session, id);
      if (!pessoa) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      applyInput(pessoa, input as Partial<Pessoa>, { partial: true });
      await session.commit();
      return pessoa as PessoaDto;
    });
  }

  async remove(id: number): Promise<void> {
    return withSession(async (session) => {
      const pessoa = await this.repository.findById(session, id);
      if (!pessoa) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      await session.remove(pessoa);
      await session.commit();
    });
  }
}
