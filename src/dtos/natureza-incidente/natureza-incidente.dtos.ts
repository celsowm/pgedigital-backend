import {
  createMetalCrudDtoClasses,
  t
} from "adorn-api";
import { NaturezaIncidente } from "../../entities/NaturezaIncidente";
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

const naturezaIncidenteCrud = createMetalCrudDtoClasses(NaturezaIncidente, {
  response: { description: "Natureza do incidente retornada pela API." },
  mutationExclude: ["id"]
});

export const {
  response: NaturezaIncidenteDto,
  create: CreateNaturezaIncidenteDto,
  replace: ReplaceNaturezaIncidenteDto,
  update: UpdateNaturezaIncidenteDto,
  params: NaturezaIncidenteParamsDto
} = naturezaIncidenteCrud;

export type NaturezaIncidenteDto = NaturezaIncidente;
export type CreateNaturezaIncidenteDto = CreateDto<NaturezaIncidenteDto>;
export type ReplaceNaturezaIncidenteDto = CreateDto<NaturezaIncidenteDto>;
export type UpdateNaturezaIncidenteDto = UpdateDto<NaturezaIncidenteDto>;
export type NaturezaIncidenteParamsDto = InstanceType<typeof NaturezaIncidenteParamsDto>;

// ============ Query DTOs (DRY) ============
const naturezaIncidenteFilters = buildFilters({
  nomeContains: CommonFilters.nomeContains
});

const { paged: NaturezaIncidenteQueryDtoClass, options: NaturezaIncidenteOptionsQueryDtoClass } = 
  createCrudQueryDtoPair({
    name: "NaturezaIncidente",
    sortableColumns: ["id", "nome"],
    filters: naturezaIncidenteFilters
  });

export { NaturezaIncidenteQueryDtoClass, NaturezaIncidenteOptionsQueryDtoClass };

export interface NaturezaIncidenteQueryDto extends SortingQueryParams {
  page?: number;
  pageSize?: number;
  nomeContains?: string;
}

export interface NaturezaIncidenteOptionsQueryDto extends SortingQueryParams {
  nomeContains?: string;
}

// ============ Response DTOs ============
export const NaturezaIncidentePagedResponseDto = createCrudPagedResponseDto(
  "NaturezaIncidente",
  NaturezaIncidenteDto,
  "natureza incidente"
);

export const NaturezaIncidenteErrors = createCrudErrors("natureza incidente");

const NaturezaIncidenteOptionDtoClass = createOptionDto(
  "NaturezaIncidenteOptionDto",
  "Natureza do incidente com id e nome."
);
export { NaturezaIncidenteOptionDtoClass as NaturezaIncidenteOptionDto };
export type NaturezaIncidenteOptionDto = InstanceType<typeof NaturezaIncidenteOptionDtoClass>;

export const NaturezaIncidenteOptionsDto = createOptionsArraySchema(
  NaturezaIncidenteOptionDtoClass,
  "Lista de naturezas do incidente com id e nome."
);
