import {
  Dto,
  Errors,
  Field,
  MergeDto,
  SimpleErrorDto,
  createMetalCrudDtoClasses,
  createPagedFilterQueryDtoClass,
  createPagedResponseDtoClass,
  t
} from "adorn-api";
import { Equipe } from "../../entities/Equipe";

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
type EquipeMutationDto = Omit<EquipeDto, "id">;
export type CreateEquipeDto = EquipeMutationDto;
export type ReplaceEquipeDto = EquipeMutationDto;
export type UpdateEquipeDto = Partial<EquipeMutationDto>;
export type EquipeParamsDto = InstanceType<typeof EquipeParamsDto>;

@Dto({ description: "Resumo da especializada da equipe." })
export class EspecializadaResumoDto {
  @Field(t.integer())
  id!: number;

  @Field(t.string({ minLength: 1 }))
  nome!: string;
}

@Dto({ description: "Relacionamento com a especializada da equipe." })
export class EquipeEspecializadaDto {
  @Field(t.ref(EspecializadaResumoDto))
  especializada!: EspecializadaResumoDto;
}

@MergeDto([EquipeDto, EquipeEspecializadaDto], {
  name: "EquipeWithEspecializadaDto",
  description: "Equipe com especializada resumida."
})
export class EquipeWithEspecializadaDto {}

export const EquipeQueryDtoClass = createPagedFilterQueryDtoClass({
  name: "EquipeQueryDto",
  filters: {
    nomeContains: { schema: t.string({ minLength: 1 }), operator: "contains" },
    especializadaId: { schema: t.integer(), operator: "equals" }
  }
});

export interface EquipeQueryDto {
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

export const EquipeErrors = Errors(SimpleErrorDto, [
  { status: 400, description: "Invalid equipe id." },
  { status: 404, description: "Equipe not found." }
]);

@Dto({ description: "Equipe com apenas id e nome." })
export class EquipeOptionDto {
  @Field(t.integer())
  id!: number;

  @Field(t.string({ minLength: 1 }))
  nome!: string;
}

export const EquipeOptionsDto = t.array(t.ref(EquipeOptionDto), {
  description: "Lista de equipes com id e nome."
});
