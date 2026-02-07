import {
  Dto,
  Field,
  MergeDto,
  createMetalCrudDtoClasses,
  t
} from "adorn-api";
import { Equipe } from "../../entities/Equipe";
import {
  createCrudErrors,
  createOptionsArraySchema,
  createOptionDto,
  EspecializadaResumoDto,
  createCrudQueryDtoPair,
  createCrudPagedResponseDto,
  CommonFilters,
  buildFilters,
  type SortingQueryParams
} from "../common";
import type { CreateDto, UpdateDto } from "../common";

const equipeCrud = createMetalCrudDtoClasses(Equipe, {
  response: { description: "Equipe retornada pela API." },
  mutationExclude: ["id"]
});

export const {
  response: EquipeDto,
  create: CreateEquipeDto,
  replace: ReplaceEquipeDto,
  update: UpdateEquipeDto,
  params: EquipeParamsDto
} = equipeCrud;

export type EquipeDto = Equipe;
export type CreateEquipeDto = CreateDto<EquipeDto>;
export type ReplaceEquipeDto = CreateDto<EquipeDto>;
export type UpdateEquipeDto = UpdateDto<EquipeDto>;
export type EquipeParamsDto = InstanceType<typeof EquipeParamsDto>;

@Dto({ description: "Relacionamento com a especializada da equipe." })
export class EquipeEspecializadaDto {
  @Field(t.ref(EspecializadaResumoDto))
  especializada!: InstanceType<typeof EspecializadaResumoDto>;
}

@MergeDto([EquipeDto, EquipeEspecializadaDto], {
  name: "EquipeWithEspecializadaDto",
  description: "Equipe com especializada resumida."
})
export class EquipeWithEspecializadaDto {}

// ============ Query DTOs (DRY) ============
const equipeFilters = buildFilters({
  nomeContains: CommonFilters.nomeContains,
  especializadaId: CommonFilters.id
});

const { paged: EquipeQueryDtoClass, options: EquipeOptionsQueryDtoClass } = 
  createCrudQueryDtoPair({
    name: "Equipe",
    sortableColumns: ["id", "nome", "especializada_id"],
    filters: equipeFilters
  });

export { EquipeQueryDtoClass, EquipeOptionsQueryDtoClass };

export interface EquipeQueryDto extends SortingQueryParams {
  page?: number;
  pageSize?: number;
  nomeContains?: string;
  especializadaId?: number;
}

export interface EquipeOptionsQueryDto extends SortingQueryParams {
  nomeContains?: string;
  especializadaId?: number;
}

// ============ Response DTOs ============
export const EquipePagedResponseDto = createCrudPagedResponseDto(
  "Equipe",
  EquipeWithEspecializadaDto,
  "equipe"
);

export const EquipeErrors = createCrudErrors("equipe");

const EquipeOptionDtoClass = createOptionDto(
  "EquipeOptionDto",
  "Equipe com apenas id e nome."
);
export { EquipeOptionDtoClass as EquipeOptionDto };
export type EquipeOptionDto = InstanceType<typeof EquipeOptionDtoClass>;

export const EquipeOptionsDto = createOptionsArraySchema(
  EquipeOptionDtoClass,
  "Lista de equipes com id e nome."
);
