import {
  createMetalCrudDtoClasses,
  t
} from "adorn-api";
import { Materia } from "../../entities/Materia";
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

const materiaCrud = createMetalCrudDtoClasses(Materia, {
  response: { description: "Matéria retornada pela API." },
  mutationExclude: ["id"]
});

export const {
  response: MateriaDto,
  create: CreateMateriaDto,
  replace: ReplaceMateriaDto,
  update: UpdateMateriaDto,
  params: MateriaParamsDto
} = materiaCrud;

export type MateriaDto = Materia;
export type CreateMateriaDto = CreateDto<MateriaDto>;
export type ReplaceMateriaDto = CreateDto<MateriaDto>;
export type UpdateMateriaDto = UpdateDto<MateriaDto>;
export type MateriaParamsDto = InstanceType<typeof MateriaParamsDto>;

// ============ Query DTOs (DRY) ============
const materiaFilters = buildFilters({
  nomeContains: CommonFilters.nomeContains
});

const { paged: MateriaQueryDtoClass, options: MateriaOptionsQueryDtoClass } = 
  createCrudQueryDtoPair({
    name: "Materia",
    sortableColumns: ["id", "nome"],
    filters: materiaFilters
  });

export { MateriaQueryDtoClass, MateriaOptionsQueryDtoClass };

export interface MateriaQueryDto extends SortingQueryParams {
  page?: number;
  pageSize?: number;
  nomeContains?: string;
}

export interface MateriaOptionsQueryDto extends SortingQueryParams {
  nomeContains?: string;
}

// ============ Response DTOs ============
export const MateriaPagedResponseDto = createCrudPagedResponseDto(
  "Materia",
  MateriaDto,
  "materia"
);

export const MateriaErrors = createCrudErrors("matéria");

const MateriaOptionDtoClass = createOptionDto(
  "MateriaOptionDto",
  "Matéria com id e nome."
);
export { MateriaOptionDtoClass as MateriaOptionDto };
export type MateriaOptionDto = InstanceType<typeof MateriaOptionDtoClass>;

export const MateriaOptionsDto = createOptionsArraySchema(
  MateriaOptionDtoClass,
  "Lista de matérias com id e nome."
);
