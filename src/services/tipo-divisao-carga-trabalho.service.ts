import { TipoDivisaoCargaTrabalho } from "../entities/TipoDivisaoCargaTrabalho";
import type {
  TipoDivisaoCargaTrabalhoQueryDto
} from "../dtos/tipo-divisao-carga-trabalho/tipo-divisao-carga-trabalho.dtos";
import {
  TipoDivisaoCargaTrabalhoRepository,
  TIPO_DIVISAO_CARGA_TRABALHO_FILTER_MAPPINGS
} from "../repositories/tipo-divisao-carga-trabalho.repository";
import { BaseService, type ListConfig } from "./base.service";

export class TipoDivisaoCargaTrabalhoService extends BaseService<
  TipoDivisaoCargaTrabalho,
  TipoDivisaoCargaTrabalhoQueryDto
> {
  protected readonly repository: TipoDivisaoCargaTrabalhoRepository;
  protected readonly listConfig: ListConfig<TipoDivisaoCargaTrabalho> = {
    filterMappings: TIPO_DIVISAO_CARGA_TRABALHO_FILTER_MAPPINGS,
    defaultSortBy: "nome",
    defaultSortOrder: "ASC"
  };

  protected readonly entityName = "tipo divisão carga trabalho";

  constructor(repository?: TipoDivisaoCargaTrabalhoRepository) {
    super();
    this.repository = repository ?? new TipoDivisaoCargaTrabalhoRepository();
  }
}
