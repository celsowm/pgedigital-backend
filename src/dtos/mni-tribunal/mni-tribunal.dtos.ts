import {
  createMetalCrudDtoClasses,
  t
} from "adorn-api";
import { MniTribunal } from "../../entities/MniTribunal";
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
export type CreateMniTribunalDto = CreateDto<MniTribunalDto>;
export type ReplaceMniTribunalDto = CreateDto<MniTribunalDto>;
export type UpdateMniTribunalDto = UpdateDto<MniTribunalDto>;
export type MniTribunalParamsDto = InstanceType<typeof MniTribunalParamsDto>;

// ============ Query DTOs (DRY) ============
const mniTribunalFilters = buildFilters({
  descricaoContains: { schema: t.string({ minLength: 1 }), operator: "contains" },
  siglaContains: { schema: t.string({ minLength: 1 }), operator: "contains" },
  identificadorCnjEquals: { schema: t.string({ minLength: 1 }), operator: "equals" }
});

const { paged: MniTribunalQueryDtoClass, options: MniTribunalOptionsQueryDtoClass } = 
  createCrudQueryDtoPair({
    name: "MniTribunal",
    sortableColumns: ["id", "sigla", "descricao", "identificador_cnj"],
    filters: mniTribunalFilters
  });

export { MniTribunalQueryDtoClass, MniTribunalOptionsQueryDtoClass };

export interface MniTribunalQueryDto extends SortingQueryParams {
  page?: number;
  pageSize?: number;
  descricaoContains?: string;
  siglaContains?: string;
  identificadorCnjEquals?: string;
}

export interface MniTribunalOptionsQueryDto extends SortingQueryParams {
  descricaoContains?: string;
  siglaContains?: string;
  identificadorCnjEquals?: string;
}

// ============ Response DTOs ============
export const MniTribunalPagedResponseDto = createCrudPagedResponseDto(
  "MniTribunal",
  MniTribunalDto,
  "MNI Tribunal"
);

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
