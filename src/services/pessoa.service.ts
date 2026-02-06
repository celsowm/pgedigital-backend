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
  PESSOA_FILTER_MAPPINGS
} from "../repositories/pessoa.repository";
import { BaseService, type ListConfig } from "./base.service";

const SORTABLE_COLUMNS = ["id", "nome", "numero_documento_principal", "tipo_pessoa"] as const;

export class PessoaService extends BaseService<
  Pessoa,
  PessoaQueryDto,
  PessoaDto,
  CreatePessoaDto,
  ReplacePessoaDto,
  UpdatePessoaDto
> {
  protected readonly repository: PessoaRepository;
  protected readonly listConfig: ListConfig<Pessoa> = {
    filterMappings: PESSOA_FILTER_MAPPINGS,
    sortableColumns: [...SORTABLE_COLUMNS],
    defaultSortBy: "id",
    defaultSortOrder: "ASC"
  };
  protected readonly entityName = "pessoa";

  constructor(repository?: PessoaRepository) {
    super();
    this.repository = repository ?? new PessoaRepository();
  }
}
