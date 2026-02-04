import {
  createMetalCrudDtoClasses,
  createPagedResponseDtoClass,
  t
} from "adorn-api";
import { ClasseProcessual } from "../../entities/ClasseProcessual";
import {
  createCrudErrors,
  createOptionsArraySchema,
  createOptionDto,
  createPagedFilterSortingQueryDtoClass,
  type SortingQueryParams
} from "../common";
import type { CreateDto, UpdateDto } from "../common";

const classeProcessualCrud = createMetalCrudDtoClasses(ClasseProcessual, {
  response: { description: "Classe processual retornada pela API." },
  mutationExclude: ["id"]
});

export const {
  response: ClasseProcessualDto,
  create: CreateClasseProcessualDto,
  replace: ReplaceClasseProcessualDto,
  update: UpdateClasseProcessualDto,
  params: ClasseProcessualParamsDto
} = classeProcessualCrud;

export type ClasseProcessualDto = ClasseProcessual;

type ClasseProcessualMutationDto = CreateDto<ClasseProcessualDto>;
export type CreateClasseProcessualDto = ClasseProcessualMutationDto;
export type ReplaceClasseProcessualDto = ClasseProcessualMutationDto;
export type UpdateClasseProcessualDto = UpdateDto<ClasseProcessualDto>;
export type ClasseProcessualParamsDto = InstanceType<typeof ClasseProcessualParamsDto>;

export const ClasseProcessualQueryDtoClass = createPagedFilterSortingQueryDtoClass({
  name: "eProcessualQueryDto",
  sortableColumns: ["id", "nome", "situacao"],
  filters: {
    nomeContains: { schema: t.string({ minLength: 1 }), operator: "contains" }
  }
});

export interface ClasseProcessualQueryDto extends SortingQueryParams {
  page?: number;
  pageSize?: number;
  nomeContains?: string;
}

export const ClasseProcessualPagedResponseDto = createPagedResponseDtoClass({
  name: "ClasseProcessualPagedResponseDto",
  itemDto: ClasseProcessualDto,
  description: "Paged classe processual list response."
});

export const ClasseProcessualErrors = createCrudErrors("classe processual");

const ClasseProcessualOptionDtoClass = createOptionDto(
  "ClasseProcessualOptionDto",
  "Classe processual com id e nome."
);
export { ClasseProcessualOptionDtoClass as ClasseProcessualOptionDto };
export type ClasseProcessualOptionDto = InstanceType<typeof ClasseProcessualOptionDtoClass>;

export const ClasseProcessualOptionsDto = createOptionsArraySchema(
  ClasseProcessualOptionDtoClass,
  "Lista de classes processuais com id e nome."
);
