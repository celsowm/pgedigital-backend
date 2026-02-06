import {
  Dto,
  Field,
  createMetalCrudDtoClasses,
  createPagedResponseDtoClass,
  t
} from "adorn-api";
import { Feriado } from "../../entities/Feriado";
import {
  createCrudErrors,
  createOptionsArraySchema,
  createOptionDto,
  createPagedFilterSortingQueryDtoClass,
  type SortingQueryParams
} from "../common";
import type { CreateDto, UpdateDto } from "../common";

const feriadoCrud = createMetalCrudDtoClasses(Feriado, {
  response: { description: "Feriado retornado pela API." },
  mutationExclude: ["id"]
});

export const {
  response: FeriadoDto,
  create: CreateFeriadoDto,
  replace: ReplaceFeriadoDto,
  update: UpdateFeriadoDto,
  params: FeriadoParamsDto
} = feriadoCrud;

export type FeriadoDto = Feriado;

type FeriadoMutationDto = CreateDto<FeriadoDto>;
export type CreateFeriadoDto = FeriadoMutationDto;
export type ReplaceFeriadoDto = FeriadoMutationDto;
export type UpdateFeriadoDto = UpdateDto<FeriadoDto>;
export type FeriadoParamsDto = InstanceType<typeof FeriadoParamsDto>;

@Dto({ description: "Resumo do tribunal (MNI)." })
export class TribunalResumoDto {
  @Field(t.integer())
  id!: number;

  @Field(t.string({ minLength: 1 }))
  descricao!: string;

  @Field(t.optional(t.string()))
  sigla?: string;
}

export const FeriadoQueryDtoClass = createPagedFilterSortingQueryDtoClass({
  name: "FeriadoQueryDto",
  sortableColumns: ["id", "data_inicio", "data_fim", "descricao"],
  filters: {
    descricaoContains: { schema: t.string({ minLength: 1 }), operator: "contains" },
    dataInicioGte: { schema: t.string({ minLength: 1 }), operator: "gte" },
    dataFimLte: { schema: t.string({ minLength: 1 }), operator: "lte" },
    tribunalId: { schema: t.integer(), operator: "equals" }
  }
});

export interface FeriadoQueryDto extends SortingQueryParams {
  page?: number;
  pageSize?: number;
  descricaoContains?: string;
  dataInicioGte?: string;
  dataFimLte?: string;
  tribunalId?: number;
}

export const FeriadoPagedResponseDto = createPagedResponseDtoClass({
  name: "FeriadoPagedResponseDto",
  itemDto: FeriadoDto,
  description: "Paged feriado list response."
});

export const FeriadoErrors = createCrudErrors("feriado");

const FeriadoOptionDtoClass = createOptionDto(
  "FeriadoOptionDto",
  "Feriado com id e descrição."
);
export { FeriadoOptionDtoClass as FeriadoOptionDto };
export type FeriadoOptionDto = InstanceType<typeof FeriadoOptionDtoClass>;

export const FeriadoOptionsDto = createOptionsArraySchema(
  FeriadoOptionDtoClass,
  "Lista de feriados com id e descrição."
);
