import {
  Dto,
  Field,
  createMetalCrudDtoClasses,
  t
} from "adorn-api";
import { Feriado } from "../../entities/Feriado";
import {
  createCrudErrors,
  createOptionsArraySchema,
  createOptionDto,
  createCrudQueryDtoPair,
  createCrudPagedResponseDto,
  CommonFilters,
  buildFilters,
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
export type CreateFeriadoDto = CreateDto<FeriadoDto>;
export type ReplaceFeriadoDto = CreateDto<FeriadoDto>;
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

// ============ Query DTOs (DRY) ============
const feriadoFilters = buildFilters({
  descricaoContains: { schema: t.string({ minLength: 1 }), operator: "contains" },
  dataInicioGte: { schema: t.string({ minLength: 1 }), operator: "gte" },
  dataFimLte: { schema: t.string({ minLength: 1 }), operator: "lte" },
  tribunalId: CommonFilters.id
});

const { paged: FeriadoQueryDtoClass, options: FeriadoOptionsQueryDtoClass } = 
  createCrudQueryDtoPair({
    name: "Feriado",
    sortableColumns: ["id", "data_inicio", "data_fim", "descricao"],
    filters: feriadoFilters
  });

export { FeriadoQueryDtoClass, FeriadoOptionsQueryDtoClass };

export interface FeriadoQueryDto extends SortingQueryParams {
  page?: number;
  pageSize?: number;
  descricaoContains?: string;
  dataInicioGte?: string;
  dataFimLte?: string;
  tribunalId?: number;
}

export interface FeriadoOptionsQueryDto extends SortingQueryParams {
  descricaoContains?: string;
  dataInicioGte?: string;
  dataFimLte?: string;
  tribunalId?: number;
}

// ============ Response DTOs ============
export const FeriadoPagedResponseDto = createCrudPagedResponseDto(
  "Feriado",
  FeriadoDto,
  "feriado"
);

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
