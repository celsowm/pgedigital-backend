import {
  createMetalCrudDtoClasses,
  createPagedResponseDtoClass,
  t
} from "adorn-api";
import { MniTribunal } from "../../entities/MniTribunal";
import {
  createCrudErrors,
  createOptionsArraySchema,
  createOptionDto,
  createPagedFilterSortingQueryDtoClass,
  type SortingQueryParams
} from "../common";
import type { CreateDto, UpdateDto } from "../common";

const mniTribunalCrud = createMetalCrudDtoClasses(MniTribunal, {
  response: { description: "MNI Tribunal retornado pela API." },
  mutationExclude: []
});

export const {
  response: MniTribunalDto,
  create: CreateMniTribunalDto,
  replace: ReplaceMniTribunalDto,
  update: UpdateMniTribunalDto,
  params: MniTribunalParamsDto
} = mniTribunalCrud;

export type MniTribunalDto = MniTribunal;

type MniTribunalMutationDto = CreateDto<MniTribunalDto>;
export type CreateMniTribunalDto = MniTribunalMutationDto;
export type ReplaceMniTribunalDto = MniTribunalMutationDto;
export type UpdateMniTribunalDto = UpdateDto<MniTribunalDto>;
export type MniTribunalParamsDto = InstanceType<typeof MniTribunalParamsDto>;

export const MniTribunalQueryDtoClass = createPagedFilterSortingQueryDtoClass({
  name: "MniTribunalQueryDto",
  sortableColumns: ["id", "sigla", "descricao", "identificador_cnj"],
  filters: {
    descricaoContains: { schema: t.string({ minLength: 1 }), operator: "contains" },
    siglaContains: { schema: t.string({ minLength: 1 }), operator: "contains" },
    identificadorCnjEquals: { schema: t.string({ minLength: 1 }), operator: "equals" }
  }
});

export interface MniTribunalQueryDto extends SortingQueryParams {
  page?: number;
  pageSize?: number;
  descricaoContains?: string;
  siglaContains?: string;
  identificadorCnjEquals?: string;
}

export const MniTribunalPagedResponseDto = createPagedResponseDtoClass({
  name: "MniTribunalPagedResponseDto",
  itemDto: MniTribunalDto,
  description: "Paged MNI Tribunal list response."
});

export const MniTribunalErrors = createCrudErrors("MNI Tribunal");

const MniTribunalOptionDtoClass = createOptionDto(
  "MniTribunalOptionDto",
  "MNI Tribunal com id e nome."
);
export { MniTribunalOptionDtoClass as MniTribunalOptionDto };
export type MniTribunalOptionDto = InstanceType<typeof MniTribunalOptionDtoClass>;

export const MniTribunalOptionsDto = createOptionsArraySchema(
  MniTribunalOptionDtoClass,
  "Lista de MNI Tribunais com id e nome."
);
