import {
  createMetalCrudDtoClasses,
  t
} from "adorn-api";
import { Pessoa } from "../../entities/Pessoa";
import {
  createCrudErrors,
  createOptionsArraySchema,
  createOptionDto,
  createCrudQueryDtoPair,
  createCrudPagedResponseDto,
  CommonFilters,
  buildFilters,
  type SortingQueryParams,
  type CreateDto,
  type UpdateDto
} from "../common";

const pessoaCrud = createMetalCrudDtoClasses(Pessoa, {
  response: { description: "Pessoa retornada pela API." },
  mutationExclude: ["id"]
});

export const {
  response: PessoaDto,
  create: CreatePessoaDto,
  replace: ReplacePessoaDto,
  update: UpdatePessoaDto,
  params: PessoaParamsDto
} = pessoaCrud;

export type PessoaDto = Pessoa;
export type CreatePessoaDto = CreateDto<PessoaDto>;
export type ReplacePessoaDto = CreateDto<PessoaDto>;
export type UpdatePessoaDto = UpdateDto<PessoaDto>;
export type PessoaParamsDto = InstanceType<typeof PessoaParamsDto>;

// ============ Query DTOs (DRY) ============
const pessoaFilters = buildFilters({
  nomeContains: CommonFilters.nomeContains,
  numeroDocumentoPrincipalContains: { schema: t.string({ minLength: 1 }), operator: "contains" }
});

const { paged: PessoaQueryDtoClass, options: PessoaOptionsQueryDtoClass } = 
  createCrudQueryDtoPair({
    name: "Pessoa",
    sortableColumns: ["id", "nome", "numero_documento_principal", "tipo_pessoa"],
    filters: pessoaFilters
  });

export { PessoaQueryDtoClass, PessoaOptionsQueryDtoClass };

export interface PessoaQueryDto extends SortingQueryParams {
  page?: number;
  pageSize?: number;
  nomeContains?: string;
  numeroDocumentoPrincipalContains?: string;
}

export interface PessoaOptionsQueryDto extends SortingQueryParams {
  nomeContains?: string;
  numeroDocumentoPrincipalContains?: string;
}

// ============ Response DTOs ============
export const PessoaPagedResponseDto = createCrudPagedResponseDto(
  "Pessoa",
  PessoaDto,
  "pessoa"
);

export const PessoaErrors = createCrudErrors("pessoa");

const PessoaOptionDtoClass = createOptionDto(
  "PessoaOptionDto",
  "Pessoa com id e nome."
);
export { PessoaOptionDtoClass as PessoaOptionDto };
export type PessoaOptionDto = InstanceType<typeof PessoaOptionDtoClass>;

export const PessoaOptionsDto = createOptionsArraySchema(
  PessoaOptionDtoClass,
  "Lista de pessoas com id e nome."
);
