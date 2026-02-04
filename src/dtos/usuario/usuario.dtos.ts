import {
  Dto,
  Field,
  MergeDto,
  createMetalCrudDtoClasses,
  createPagedResponseDtoClass,
  t
} from "adorn-api";
import { Usuario } from "../../entities/Usuario";
import {
  createCrudErrors,
  createOptionDto,
  createOptionsArraySchema,
  createPagedFilterSortingQueryDtoClass,
  type SortingQueryParams
} from "../common";

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

@Dto({ description: "Thumbnail do usuário." })
export class UsuarioThumbnailDto {
  @Field(t.integer())
  id!: number;

  @Field(t.optional(t.bytes()))
  thumbnail?: string;
}

@Dto({ description: "Relacionamentos do usuário." })
export class UsuarioRelationsDto {
  @Field(t.optional(t.ref(EspecializadaResumoDto)))
  especializada?: EspecializadaResumoDto | null;

  @Field(t.optional(t.ref(UsuarioThumbnailDto)))
  usuarioThumbnail?: UsuarioThumbnailDto | null;
}

@MergeDto([UsuarioDto, UsuarioRelationsDto], {
  name: "UsuarioWithRelationsDto",
  description: "Usuário com especializada e thumbnail."
})
export class UsuarioWithRelationsDto {}

export const UsuarioQueryDtoClass = createPagedFilterSortingQueryDtoClass({
  name: "UsuarioQueryDto",
  sortableColumns: ["id", "nome", "login", "cargo"],
  filters: {
    nomeContains: { schema: t.string({ minLength: 1 }), operator: "contains" },
    cargoContains: { schema: t.string({ minLength: 1 }), operator: "contains" },
    especializadaId: { schema: t.integer(), operator: "equals" }
  }
});

export interface UsuarioQueryDto extends SortingQueryParams {
  page?: number;
  pageSize?: number;
  nomeContains?: string;
  cargoContains?: string;
  especializadaId?: number;
}

export const UsuarioPagedResponseDto = createPagedResponseDtoClass({
  name: "UsuarioPagedResponseDto",
  itemDto: UsuarioWithRelationsDto,
  description: "Paged usuario list response."
});

export const UsuarioErrors = createCrudErrors("usuario");

const UsuarioOptionDtoClass = createOptionDto(
  "UsuarioOptionDto",
  "Usuário com apenas id e nome."
);
export { UsuarioOptionDtoClass as UsuarioOptionDto };
export type UsuarioOptionDto = InstanceType<typeof UsuarioOptionDtoClass>;

export const UsuarioOptionsDto = createOptionsArraySchema(
  UsuarioOptionDtoClass,
  "Lista de usuários com id e nome."
);
