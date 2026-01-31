import {
  createMetalCrudDtoClasses,
  createPagedFilterQueryDtoClass,
  createPagedResponseDtoClass,
  t
} from "adorn-api";
import { TipoAudiencia } from "../../entities/TipoAudiencia";
import { createOptionsArraySchema, createOptionDto } from "../common";

const tipoAudienciaCrud = createMetalCrudDtoClasses(TipoAudiencia, {
  response: { description: "Tipo de audiencia retornado pela API." },
  mutationExclude: ["id"]
});

export const { response: TipoAudienciaDto } = tipoAudienciaCrud;
export type TipoAudienciaDto = TipoAudiencia;

export const TipoAudienciaQueryDtoClass = createPagedFilterQueryDtoClass({
  name: "TipoAudienciaQueryDto",
  filters: {
    descricaoContains: { schema: t.string({ minLength: 1 }), operator: "contains" },
    tipoProcessoAdministrativoId: { schema: t.number(), operator: "equals" }
  }
});

export interface TipoAudienciaQueryDto {
  page?: number;
  pageSize?: number;
  descricaoContains?: string;
  tipoProcessoAdministrativoId?: number;
}

export const TipoAudienciaPagedResponseDto = createPagedResponseDtoClass({
  name: "TipoAudienciaPagedResponseDto",
  itemDto: TipoAudienciaDto,
  description: "Paged tipo audiencia list response."
});

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
