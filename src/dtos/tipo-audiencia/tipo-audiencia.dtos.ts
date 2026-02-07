import {
  createMetalCrudDtoClasses,
  t
} from "adorn-api";
import { TipoAudiencia } from "../../entities/TipoAudiencia";
import {
  createOptionsArraySchema,
  createOptionDto,
  createCrudQueryDtoPair,
  createCrudPagedResponseDto,
  CommonFilters,
  buildFilters,
  type SortingQueryParams
} from "../common";

const tipoAudienciaCrud = createMetalCrudDtoClasses(TipoAudiencia, {
  response: { description: "Tipo de audiencia retornado pela API." },
  mutationExclude: ["id"]
});

export const { response: TipoAudienciaDto } = tipoAudienciaCrud;
export type TipoAudienciaDto = TipoAudiencia;

// ============ Query DTOs (DRY) ============
const tipoAudienciaFilters = buildFilters({
  descricaoContains: { schema: t.string({ minLength: 1 }), operator: "contains" },
  tipoProcessoAdministrativoId: { schema: t.number(), operator: "equals" }
});

const { paged: TipoAudienciaQueryDtoClass, options: TipoAudienciaOptionsQueryDtoClass } = 
  createCrudQueryDtoPair({
    name: "TipoAudiencia",
    sortableColumns: ["id", "descricao"],
    filters: tipoAudienciaFilters
  });

export { TipoAudienciaQueryDtoClass, TipoAudienciaOptionsQueryDtoClass };

export interface TipoAudienciaQueryDto extends SortingQueryParams {
  page?: number;
  pageSize?: number;
  descricaoContains?: string;
  tipoProcessoAdministrativoId?: number;
}

export interface TipoAudienciaOptionsQueryDto extends SortingQueryParams {
  descricaoContains?: string;
  tipoProcessoAdministrativoId?: number;
}

// ============ Response DTOs ============
export const TipoAudienciaPagedResponseDto = createCrudPagedResponseDto(
  "TipoAudiencia",
  TipoAudienciaDto,
  "tipo audiencia"
);

const TipoAudienciaOptionDtoClass = createOptionDto(
  "TipoAudienciaOptionDto",
  "Tipo audiencia com id e descricao."
);
export { TipoAudienciaOptionDtoClass as TipoAudienciaOptionDto };
export type TipoAudienciaOptionDto = InstanceType<typeof TipoAudienciaOptionDtoClass>;

export const TipoAudienciaOptionsDto = createOptionsArraySchema(
  TipoAudienciaOptionDtoClass,
  "Lista de tipos audiencia com id e descricao."
);
