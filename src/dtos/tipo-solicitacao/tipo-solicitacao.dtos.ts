import {
  createMetalCrudDtoClasses,
  t
} from "adorn-api";
import { TipoSolicitacao } from "../../entities/TipoSolicitacao";
import {
  createOptionsArraySchema,
  createOptionDto,
  createCrudQueryDtoPair,
  createCrudPagedResponseDto,
  CommonFilters,
  buildFilters,
  type SortingQueryParams
} from "../common";

const tipoSolicitacaoCrud = createMetalCrudDtoClasses(TipoSolicitacao, {
  response: { description: "Tipo de solicitacao retornado pela API." },
  mutationExclude: ["id"]
});

export const { response: TipoSolicitacaoDto } = tipoSolicitacaoCrud;
export type TipoSolicitacaoDto = TipoSolicitacao;

// ============ Query DTOs (DRY) ============
const tipoSolicitacaoFilters = buildFilters({
  nomeContains: CommonFilters.nomeContains,
  solicitacaoExterna: { schema: t.boolean(), operator: "equals" }
});

const { paged: TipoSolicitacaoQueryDtoClass, options: TipoSolicitacaoOptionsQueryDtoClass } = 
  createCrudQueryDtoPair({
    name: "TipoSolicitacao",
    sortableColumns: ["id", "nome"],
    filters: tipoSolicitacaoFilters
  });

export { TipoSolicitacaoQueryDtoClass, TipoSolicitacaoOptionsQueryDtoClass };

export interface TipoSolicitacaoQueryDto extends SortingQueryParams {
  page?: number;
  pageSize?: number;
  nomeContains?: string;
  solicitacaoExterna?: boolean;
}

export interface TipoSolicitacaoOptionsQueryDto extends SortingQueryParams {
  nomeContains?: string;
  solicitacaoExterna?: boolean;
}

// ============ Response DTOs ============
export const TipoSolicitacaoPagedResponseDto = createCrudPagedResponseDto(
  "TipoSolicitacao",
  TipoSolicitacaoDto,
  "tipo solicitacao"
);

const TipoSolicitacaoOptionDtoClass = createOptionDto(
  "TipoSolicitacaoOptionDto",
  "Tipo solicitacao com id e nome."
);
export { TipoSolicitacaoOptionDtoClass as TipoSolicitacaoOptionDto };
export type TipoSolicitacaoOptionDto = InstanceType<typeof TipoSolicitacaoOptionDtoClass>;

export const TipoSolicitacaoOptionsDto = createOptionsArraySchema(
  TipoSolicitacaoOptionDtoClass,
  "Lista de tipos solicitacao com id e nome."
);
