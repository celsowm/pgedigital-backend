import {
  Dto,
  Field,
  MergeDto,
  createMetalCrudDtoClasses,
  createPagedResponseDtoClass,
  t
} from "adorn-api";
import { Equipe } from "../../entities/Equipe";
import {
  createCrudErrors,
  createOptionsArraySchema,
  createOptionDto,
  EspecializadaResumoDto,
  type CreateDto,
  type UpdateDto,
  createPagedFilterSortingQueryDtoClass,
  type SortingQueryParams
} from "../common";

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
type EquipeMutationDto = CreateDto<EquipeDto>;
export type CreateEquipeDto = EquipeMutationDto;
export type ReplaceEquipeDto = EquipeMutationDto;
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

export const EquipeQueryDtoClass = createPagedFilterSortingQueryDtoClass({
  name: "EquipeQueryDto",
  sortableColumns: ["id", "nome", "especializada_id"],
  filters: {
    nomeContains: { schema: t.string({ minLength: 1 }), operator: "contains" },
    especializadaId: { schema: t.integer(), operator: "equals" }
  }
});

export interface EquipeQueryDto extends SortingQueryParams {
  page?: number;
  pageSize?: number;
  nomeContains?: string;
  especializadaId?: number;
}

export const EquipePagedResponseDto = createPagedResponseDtoClass({
  name: "EquipePagedResponseDto",
  itemDto: EquipeWithEspecializadaDto,
  description: "Paged equipe list response."
});

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
