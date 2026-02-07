import {
  createMetalCrudDtoClasses,
  t
} from "adorn-api";
import { NotaVersao } from "../../entities/NotaVersao";
import {
  createCrudErrors,
  createPagedFilterSortingQueryDtoClass,
  createCrudPagedResponseDto,
  buildFilters,
  type SortingQueryParams,
  type CreateDto,
  type UpdateDto
} from "../common";

const notaVersaoCrud = createMetalCrudDtoClasses(NotaVersao, {
  response: { description: "Nota versao retornada pela API." },
  mutationExclude: ["id"]
});

export const {
  response: NotaVersaoDto,
  create: CreateNotaVersaoDto,
  replace: ReplaceNotaVersaoDto,
  update: UpdateNotaVersaoDto,
  params: NotaVersaoParamsDto
} = notaVersaoCrud;

export type NotaVersaoDto = NotaVersao;
export type CreateNotaVersaoDto = CreateDto<NotaVersaoDto>;
export type ReplaceNotaVersaoDto = CreateDto<NotaVersaoDto>;
export type UpdateNotaVersaoDto = UpdateDto<NotaVersaoDto>;
export type NotaVersaoParamsDto = InstanceType<typeof NotaVersaoParamsDto>;

// ============ Query DTOs ============
const notaVersaoFilters = buildFilters({
  sprint: { schema: t.integer({ minimum: 1 }), operator: "equals" },
  ativo: { schema: t.boolean(), operator: "equals" },
  mensagemContains: { schema: t.string({ minLength: 1 }), operator: "contains" }
});

export const NotaVersaoQueryDtoClass = createPagedFilterSortingQueryDtoClass({
  name: "NotaVersaoQueryDto",
  sortableColumns: ["id", "data", "sprint", "ativo"],
  filters: notaVersaoFilters
});

export interface NotaVersaoQueryDto extends SortingQueryParams {
  page?: number;
  pageSize?: number;
  sprint?: number;
  ativo?: boolean;
  mensagemContains?: string;
}

// ============ Response DTOs ============
export const NotaVersaoPagedResponseDto = createCrudPagedResponseDto(
  "NotaVersao",
  NotaVersaoDto,
  "nota versao"
);

export const NotaVersaoErrors = createCrudErrors("nota versao");
