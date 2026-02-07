import {
  createMetalCrudDtoClasses,
  t
} from "adorn-api";
import { PalavraChave } from "../../entities/PalavraChave";
import {
  createCrudErrors,
  createPagedFilterSortingQueryDtoClass,
  createCrudPagedResponseDto,
  buildFilters,
  type SortingQueryParams,
  type CreateDto,
  type UpdateDto
} from "../common";

const palavraChaveCrud = createMetalCrudDtoClasses(PalavraChave, {
  response: { description: "Palavra-chave retornada pela API." },
  mutationExclude: ["id"]
});

export const {
  response: PalavraChaveDto,
  create: CreatePalavraChaveDto,
  replace: ReplacePalavraChaveDto,
  update: UpdatePalavraChaveDto,
  params: PalavraChaveParamsDto
} = palavraChaveCrud;

export type PalavraChaveDto = PalavraChave;
export type CreatePalavraChaveDto = CreateDto<PalavraChaveDto>;
export type ReplacePalavraChaveDto = CreateDto<PalavraChaveDto>;
export type UpdatePalavraChaveDto = UpdateDto<PalavraChaveDto>;
export type PalavraChaveParamsDto = InstanceType<typeof PalavraChaveParamsDto>;

// ============ Query DTOs ============
const palavraChaveFilters = buildFilters({
  palavraContains: { schema: t.string({ minLength: 1 }), operator: "contains" },
  obrigatoriedade: { schema: t.boolean(), operator: "equals" }
});

export const PalavraChaveQueryDtoClass = createPagedFilterSortingQueryDtoClass({
  name: "PalavraChaveQueryDto",
  sortableColumns: ["id", "palavra", "obrigatoriedade"],
  filters: palavraChaveFilters
});

export interface PalavraChaveQueryDto extends SortingQueryParams {
  page?: number;
  pageSize?: number;
  palavraContains?: string;
  obrigatoriedade?: boolean;
}

// ============ Response DTOs ============
export const PalavraChavePagedResponseDto = createCrudPagedResponseDto(
  "PalavraChave",
  PalavraChaveDto,
  "palavra-chave"
);

export const PalavraChaveErrors = createCrudErrors("palavra-chave");
