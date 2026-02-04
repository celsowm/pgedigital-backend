import {
  createMetalCrudDtoClasses,
  createPagedResponseDtoClass,
  t
} from "adorn-api";
import { NaturezaIncidente } from "../../entities/NaturezaIncidente";
import {
  createCrudErrors,
  createOptionsArraySchema,
  createOptionDto,
  createPagedFilterSortingQueryDtoClass,
  type SortingQueryParams
} from "../common";
import type { CreateDto, UpdateDto } from "../common";

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

type NaturezaIncidenteMutationDto = CreateDto<NaturezaIncidenteDto>;
export type CreateNaturezaIncidenteDto = NaturezaIncidenteMutationDto;
export type ReplaceNaturezaIncidenteDto = NaturezaIncidenteMutationDto;
export type UpdateNaturezaIncidenteDto = UpdateDto<NaturezaIncidenteDto>;
export type NaturezaIncidenteParamsDto = InstanceType<typeof NaturezaIncidenteParamsDto>;

export const NaturezaIncidenteQueryDtoClass = createPagedFilterSortingQueryDtoClass({
  name: "NaturezaIncidenteQueryDto",
  sortableColumns: ["id", "nome"],
  filters: {
    nomeContains: { schema: t.string({ minLength: 1 }), operator: "contains" }
  }
});

export interface NaturezaIncidenteQueryDto extends SortingQueryParams {
  page?: number;
  pageSize?: number;
  nomeContains?: string;
}

export const NaturezaIncidentePagedResponseDto = createPagedResponseDtoClass({
  name: "NaturezaIncidentePagedResponseDto",
  itemDto: NaturezaIncidenteDto,
  description: "Paged natureza do incidente list response."
});

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
