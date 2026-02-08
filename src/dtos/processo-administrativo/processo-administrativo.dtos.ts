import {
  createMetalCrudDtoClasses,
  t
} from "adorn-api";
import { ProcessoAdministrativo } from "../../entities/ProcessoAdministrativo";
import {
  createCrudErrors,
  createPagedFilterSortingQueryDtoClass,
  createCrudPagedResponseDto,
  buildFilters,
  type SortingQueryParams
} from "../common";

const processoAdministrativoCrud = createMetalCrudDtoClasses(ProcessoAdministrativo, {
  response: { description: "Processo administrativo retornado pela API." },
  mutationExclude: ["id"]
});

export const {
  response: ProcessoAdministrativoDto,
  params: ProcessoAdministrativoParamsDto
} = processoAdministrativoCrud;

export type ProcessoAdministrativoDto = ProcessoAdministrativo;
export type ProcessoAdministrativoParamsDto = InstanceType<typeof ProcessoAdministrativoParamsDto>;

// ============ Query DTOs ============
const processoAdministrativoFilters = buildFilters({
  codigoPa: { schema: t.string({ minLength: 1 }), operator: "equals" },
  tipoProcessoAdministrativoId: { schema: t.integer({ minimum: 1 }), operator: "equals" }
});

export const ProcessoAdministrativoQueryDtoClass = createPagedFilterSortingQueryDtoClass({
  name: "ProcessoAdministrativoQueryDto",
  sortableColumns: ["id", "codigo_pa", "data_criacao"],
  filters: processoAdministrativoFilters
});

export interface ProcessoAdministrativoQueryDto extends SortingQueryParams {
  page?: number;
  pageSize?: number;
  codigoPa?: string;
  tipoProcessoAdministrativoId?: number;
}

// ============ Response DTOs ============
export const ProcessoAdministrativoPagedResponseDto = createCrudPagedResponseDto(
  "ProcessoAdministrativo",
  ProcessoAdministrativoDto,
  "processo administrativo"
);

export const ProcessoAdministrativoErrors = createCrudErrors("processo administrativo");
