import {
  Dto,
  Field,
  MergeDto,
  createMetalCrudDtoClasses,
  createPagedFilterQueryDtoClass,
  createPagedResponseDtoClass,
  t
} from "adorn-api";
import { Usuario } from "../../entities/Usuario";
import { createCrudErrors } from "../common";

const usuarioCrud = createMetalCrudDtoClasses(Usuario, {
  response: { description: "Usuário retornado pela API." },
  mutationExclude: ["id"]
});

export const {
  response: UsuarioDto,
  params: UsuarioParamsDto
} = usuarioCrud;

export type UsuarioDto = Usuario;
export type UsuarioParamsDto = InstanceType<typeof UsuarioParamsDto>;

@Dto({ description: "Resumo da especializada do usuário." })
export class EspecializadaResumoDto {
  @Field(t.string({ minLength: 1 }))
  nome!: string;

  @Field(t.string())
  sigla!: string | null;
}

@Dto({ description: "Relacionamento com a especializada do usuário." })
export class UsuarioEspecializadaDto {
  @Field(t.ref(EspecializadaResumoDto))
  especializada!: EspecializadaResumoDto | null;
}

@MergeDto([UsuarioDto, UsuarioEspecializadaDto], {
  name: "UsuarioWithEspecializadaDto",
  description: "Usuário com especializada resumida."
})
export class UsuarioWithEspecializadaDto {}

export const UsuarioQueryDtoClass = createPagedFilterQueryDtoClass({
  name: "UsuarioQueryDto",
  filters: {
    nomeContains: { schema: t.string({ minLength: 1 }), operator: "contains" },
    cargoContains: { schema: t.string({ minLength: 1 }), operator: "contains" }
  }
});

export interface UsuarioQueryDto {
  page?: number;
  pageSize?: number;
  nomeContains?: string;
  cargoContains?: string;
}

export const UsuarioPagedResponseDto = createPagedResponseDtoClass({
  name: "UsuarioPagedResponseDto",
  itemDto: UsuarioWithEspecializadaDto,
  description: "Paged usuario list response."
});

export const UsuarioErrors = createCrudErrors("usuario");
