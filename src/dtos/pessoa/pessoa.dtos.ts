import {
  createMetalCrudDtoClasses,
  createPagedResponseDtoClass,
  t
} from "adorn-api";
import { Pessoa } from "../../entities/Pessoa";
import {
  createCrudErrors,
  createOptionsArraySchema,
  createOptionDto,
  createPagedFilterSortingQueryDtoClass,
  type SortingQueryParams
} from "../common";
import type { CreateDto, UpdateDto } from "../common";

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

type PessoaMutationDto = CreateDto<PessoaDto>;
export type CreatePessoaDto = PessoaMutationDto;
export type ReplacePessoaDto = PessoaMutationDto;
export type UpdatePessoaDto = UpdateDto<PessoaDto>;
export type PessoaParamsDto = InstanceType<typeof PessoaParamsDto>;

export const PessoaQueryDtoClass = createPagedFilterSortingQueryDtoClass({
  name: "PessoaQueryDto",
  sortableColumns: ["id", "nome", "numero_documento_principal", "tipo_pessoa"],
  filters: {
    nomeContains: { schema: t.string({ minLength: 1 }), operator: "contains" },
    numeroDocumentoPrincipalContains: { schema: t.string({ minLength: 1 }), operator: "contains" }
  }
});

export interface PessoaQueryDto extends SortingQueryParams {
  page?: number;
  pageSize?: number;
  nomeContains?: string;
  numeroDocumentoPrincipalContains?: string;
}

export const PessoaPagedResponseDto = createPagedResponseDtoClass({
  name: "PessoaPagedResponseDto",
  itemDto: PessoaDto,
  description: "Paged pessoa list response."
});

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
