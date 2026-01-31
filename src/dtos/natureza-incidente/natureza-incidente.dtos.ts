import {
  createMetalCrudDtoClasses,
  createPagedFilterQueryDtoClass,
  createPagedResponseDtoClass,
  t
} from "adorn-api";
import { NaturezaIncidente } from "../../entities/NaturezaIncidente";
import {
  createCrudErrors,
  createOptionsArraySchema,
  createOptionDto
} from "../common";
import type { CreateDto, UpdateDto } from "../common";

const naturezaIncidenteCrud = createMetalCrudDtoClasses(NaturezaIncidente, {
  response: { description: "Natureza de incidente retornada pela API." },
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

export const NaturezaIncidenteQueryDtoClass = createPagedFilterQueryDtoClass({
  name: "NaturezaIncidenteQueryDto",
  filters: {
    nomeContains: { schema: t.string({ minLength: 1 }), operator: "contains" }
  }
});

export interface NaturezaIncidenteQueryDto {
  page?: number;
  pageSize?: number;
  nomeContains?: string;
}

export const NaturezaIncidentePagedResponseDto = createPagedResponseDtoClass({
  name: "NaturezaIncidentePagedResponseDto",
  itemDto: NaturezaIncidenteDto,
  description: "Paged natureza incidente list response."
});

export const NaturezaIncidenteErrors = createCrudErrors("natureza incidente");

const NaturezaIncidenteOptionDtoClass = createOptionDto(
  "NaturezaIncidenteOptionDto",
  "Natureza de incidente com id e nome."
);
export { NaturezaIncidenteOptionDtoClass as NaturezaIncidenteOptionDto };
export type NaturezaIncidenteOptionDto = InstanceType<typeof NaturezaIncidenteOptionDtoClass>;

export const NaturezaIncidenteOptionsDto = createOptionsArraySchema(
  NaturezaIncidenteOptionDtoClass,
  "Lista de naturezas de incidente com id e nome."
);
