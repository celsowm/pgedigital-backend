import {
  createMetalCrudDtoClasses,
  createPagedResponseDtoClass,
  Dto,
  Field,
  MergeDto,
  t
} from "adorn-api";
import { Tema } from "../../entities/Tema";
import {
  createCrudErrors,
  createIdNomeResumoDto,
  createOptionsArraySchema,
  createOptionDto,
  createPagedFilterSortingQueryDtoClass,
  createTreeDtoClasses,
  type SortingQueryParams,
  type CreateDto,
  type UpdateDto
} from "../common";

const temaCrud = createMetalCrudDtoClasses(Tema, {
  response: { description: "Tema retornado pela API." },
  mutationExclude: ["id", "lft", "rght", "cod_nivel"]
});

export const {
  response: TemaDto,
  create: CreateTemaDto,
  replace: ReplaceTemaDto,
  update: UpdateTemaDto,
  params: TemaParamsDto
} = temaCrud;

export type TemaDto = Tema;

type TemaMutationDto = CreateDto<TemaDto, "lft" | "rght" | "cod_nivel">;
export type CreateTemaDto = TemaMutationDto;
export type ReplaceTemaDto = TemaMutationDto;
export type UpdateTemaDto = UpdateDto<TemaDto, "lft" | "rght" | "cod_nivel">;
export type TemaParamsDto = InstanceType<typeof TemaParamsDto>;

export const MateriaResumoDto = createIdNomeResumoDto(
  "MateriaResumoDto",
  "Resumo da matéria."
);

@Dto({ description: "Relacionamentos do tema." })
export class TemaRelationsDto {
  @Field(t.optional(t.ref(MateriaResumoDto)))
  materia?: InstanceType<typeof MateriaResumoDto> | null;
}

@MergeDto([TemaDto, TemaRelationsDto], {
  name: "TemaWithRelationsDto",
  description: "Tema com matéria."
})
export class TemaWithRelationsDto {}

export const {
  node: TemaNodeDto,
  nodeResult: TemaNodeResultDto,
  threadedNode: TemaThreadedNodeDto,
  treeListEntry: TemaTreeListEntryDto,
  treeListSchema: TemaTreeListSchema,
  threadedTreeSchema: TemaThreadedTreeSchema
} = createTreeDtoClasses("Tema", TemaDto, {
  parentSchema: t.nullable(t.integer())
});

export const TemaQueryDtoClass = createPagedFilterSortingQueryDtoClass({
  name: "TemaQueryDto",
  sortableColumns: ["id", "nome", "materia_id", "parent_id", "peso"],
  filters: {
    nomeContains: { schema: t.string({ minLength: 1 }), operator: "contains" },
    materiaId: { schema: t.number(), operator: "equals" },
    parentId: { schema: t.number(), operator: "equals" }
  }
});

export interface TemaQueryDto extends SortingQueryParams {
  page?: number;
  pageSize?: number;
  nomeContains?: string;
  materiaId?: number;
  parentId?: number;
}

@Dto({ name: "TemaTreeQueryDto", description: "Optional filters for tema tree routes." })
export class TemaTreeQueryDtoClass {
  @Field(t.optional(t.integer()))
  rootId?: number;

  @Field(t.optional(t.integer()))
  materiaId?: number;

  @Field(t.optional(t.integer({ minimum: 0 })))
  depth?: number;
}

export interface TemaTreeQueryDto {
  rootId?: number;
  materiaId?: number;
  depth?: number;
}

export const TemaPagedResponseDto = createPagedResponseDtoClass({
  name: "TemaPagedResponseDto",
  itemDto: TemaDto,
  description: "Paged tema list response."
});

export const TemaErrors = createCrudErrors("tema");

const TemaOptionDtoClass = createOptionDto(
  "TemaOptionDto",
  "Tema com id e nome."
);
export { TemaOptionDtoClass as TemaOptionDto };
export type TemaOptionDto = InstanceType<typeof TemaOptionDtoClass>;

export const TemaOptionsDto = createOptionsArraySchema(
  TemaOptionDtoClass,
  "Lista de temas com id e nome."
);
