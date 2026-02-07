import {
  createMetalCrudDtoClasses,
  t
} from "adorn-api";
import { ClasseProcessual } from "../../entities/ClasseProcessual";
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
export type CreateClasseProcessualDto = CreateDto<ClasseProcessualDto>;
export type ReplaceClasseProcessualDto = CreateDto<ClasseProcessualDto>;
export type UpdateClasseProcessualDto = UpdateDto<ClasseProcessualDto>;
export type ClasseProcessualParamsDto = InstanceType<typeof ClasseProcessualParamsDto>;

// ============ Query DTOs (DRY) ============
const classeProcessualFilters = buildFilters({
  nomeContains: CommonFilters.nomeContains
});

const { paged: ClasseProcessualQueryDtoClass, options: ClasseProcessualOptionsQueryDtoClass } = 
  createCrudQueryDtoPair({
    name: "ClasseProcessual",
    sortableColumns: ["id", "nome", "situacao"],
    filters: classeProcessualFilters
  });

export { ClasseProcessualQueryDtoClass, ClasseProcessualOptionsQueryDtoClass };

export interface ClasseProcessualQueryDto extends SortingQueryParams {
  page?: number;
  pageSize?: number;
  nomeContains?: string;
}

export interface ClasseProcessualOptionsQueryDto extends SortingQueryParams {
  nomeContains?: string;
}

// ============ Response DTOs ============
export const ClasseProcessualPagedResponseDto = createCrudPagedResponseDto(
  "ClasseProcessual",
  ClasseProcessualDto,
  "classe processual"
);

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
