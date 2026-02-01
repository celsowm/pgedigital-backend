import {
  createMetalCrudDtoClasses,
  createPagedFilterQueryDtoClass,
  createPagedResponseDtoClass,
  t
} from "adorn-api";
import { Classificacao } from "../../entities/Classificacao";
import {
  createCrudErrors,
  createOptionsArraySchema,
  createOptionDto
} from "../common";
import type { CreateDto, UpdateDto } from "../common";

const classificacaoCrud = createMetalCrudDtoClasses(Classificacao, {
  response: { description: "Classificação retornada pela API." },
  mutationExclude: ["id"]
});

export const {
  response: ClassificacaoDto,
  create: CreateClassificacaoDto,
  replace: ReplaceClassificacaoDto,
  update: UpdateClassificacaoDto,
  params: ClassificacaoParamsDto
} = classificacaoCrud;

export type ClassificacaoDto = Classificacao;

type ClassificacaoMutationDto = CreateDto<ClassificacaoDto>;
export type CreateClassificacaoDto = ClassificacaoMutationDto;
export type ReplaceClassificacaoDto = ClassificacaoMutationDto;
export type UpdateClassificacaoDto = UpdateDto<ClassificacaoDto>;
export type ClassificacaoParamsDto = InstanceType<typeof ClassificacaoParamsDto>;

export const ClassificacaoQueryDtoClass = createPagedFilterQueryDtoClass({
  name: "ClassificacaoQueryDto",
  filters: {
    nomeContains: { schema: t.string({ minLength: 1 }), operator: "contains" }
  }
});

export interface ClassificacaoQueryDto {
  page?: number;
  pageSize?: number;
  nomeContains?: string;
}

export const ClassificacaoPagedResponseDto = createPagedResponseDtoClass({
  name: "ClassificacaoPagedResponseDto",
  itemDto: ClassificacaoDto,
  description: "Paged classificação list response."
});

export const ClassificacaoErrors = createCrudErrors("classificação");

const ClassificacaoOptionDtoClass = createOptionDto(
  "ClassificacaoOptionDto",
  "Classificação com id e nome."
);
export { ClassificacaoOptionDtoClass as ClassificacaoOptionDto };
export type ClassificacaoOptionDto = InstanceType<typeof ClassificacaoOptionDtoClass>;

export const ClassificacaoOptionsDto = createOptionsArraySchema(
  ClassificacaoOptionDtoClass,
  "Lista de classificações com id e nome."
);
