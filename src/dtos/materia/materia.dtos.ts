import {
  createMetalCrudDtoClasses,
  createPagedResponseDtoClass,
  t
} from "adorn-api";
import { Materia } from "../../entities/Materia";
import {
  createCrudErrors,
  createOptionsArraySchema,
  createOptionDto,
  createPagedFilterSortingQueryDtoClass,
  createFilterOnlySortingQueryDtoClass,
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

type MateriaMutationDto = CreateDto<MateriaDto>;
export type CreateMateriaDto = MateriaMutationDto;
export type ReplaceMateriaDto = MateriaMutationDto;
export type UpdateMateriaDto = UpdateDto<MateriaDto>;
export type MateriaParamsDto = InstanceType<typeof MateriaParamsDto>;

export const MateriaQueryDtoClass = createPagedFilterSortingQueryDtoClass({
  name: "MateriaQueryDto",
  sortableColumns: ["id", "nome"],
  filters: {
    nomeContains: { schema: t.string({ minLength: 1 }), operator: "contains" }
  }
});

export interface MateriaQueryDto extends SortingQueryParams {
  page?: number;
  pageSize?: number;
  nomeContains?: string;
}

export const MateriaOptionsQueryDtoClass = createFilterOnlySortingQueryDtoClass({
  name: "MateriaOptionsQueryDto",
  sortableColumns: ["id", "nome"],
  filters: {
    nomeContains: { schema: t.string({ minLength: 1 }), operator: "contains" }
  }
});

export interface MateriaOptionsQueryDto extends SortingQueryParams {
  nomeContains?: string;
}

export const MateriaPagedResponseDto = createPagedResponseDtoClass({
  name: "MateriaPagedResponseDto",
  itemDto: MateriaDto,
  description: "Paged materia list response."
});

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
