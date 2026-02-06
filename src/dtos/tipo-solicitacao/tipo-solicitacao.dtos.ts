import {
  createMetalCrudDtoClasses,
  createPagedResponseDtoClass,
  t
} from "adorn-api";
import { TipoSolicitacao } from "../../entities/TipoSolicitacao";
import {
  createOptionsArraySchema,
  createOptionDto,
  createFilterOnlySortingQueryDtoClass,
  createPagedFilterSortingQueryDtoClass,
  type SortingQueryParams
} from "../common";

const tipoSolicitacaoCrud = createMetalCrudDtoClasses(TipoSolicitacao, {
  response: { description: "Tipo de solicitacao retornado pela API." },
  mutationExclude: ["id"]
});

export const { response: TipoSolicitacaoDto } = tipoSolicitacaoCrud;
export type TipoSolicitacaoDto = TipoSolicitacao;

export const TipoSolicitacaoQueryDtoClass = createPagedFilterSortingQueryDtoClass({
  name: "TipoSolicitacaoQueryDto",
  sortableColumns: ["id", "nome"],
  filters: {
    nomeContains: { schema: t.string({ minLength: 1 }), operator: "contains" },
    solicitacaoExterna: { schema: t.boolean(), operator: "equals" }
  }
});

export interface TipoSolicitacaoQueryDto extends SortingQueryParams {
  page?: number;
  pageSize?: number;
  nomeContains?: string;
  solicitacaoExterna?: boolean;
}

export const TipoSolicitacaoOptionsQueryDtoClass = createFilterOnlySortingQueryDtoClass({
  name: "TipoSolicitacaoOptionsQueryDto",
  sortableColumns: ["id", "nome"],
  filters: {
    nomeContains: { schema: t.string({ minLength: 1 }), operator: "contains" },
    solicitacaoExterna: { schema: t.boolean(), operator: "equals" }
  }
});

export interface TipoSolicitacaoOptionsQueryDto extends SortingQueryParams {
  nomeContains?: string;
  solicitacaoExterna?: boolean;
}

export const TipoSolicitacaoPagedResponseDto = createPagedResponseDtoClass({
  name: "TipoSolicitacaoPagedResponseDto",
  itemDto: TipoSolicitacaoDto,
  description: "Paged tipo solicitacao list response."
});

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
