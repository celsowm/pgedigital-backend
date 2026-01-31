import {
  createMetalCrudDtoClasses,
  createPagedFilterQueryDtoClass,
  createPagedResponseDtoClass,
  t
} from "adorn-api";
import { NotaVersao } from "../../entities/NotaVersao";
import { createCrudErrors } from "../common";
import type { CreateDto, UpdateDto } from "../common";

const notaVersaoCrud = createMetalCrudDtoClasses(NotaVersao, {
  response: { description: "Nota versao retornada pela API." },
  mutationExclude: ["id"]
});

export const {
  response: NotaVersaoDto,
  create: CreateNotaVersaoDto,
  replace: ReplaceNotaVersaoDto,
  update: UpdateNotaVersaoDto,
  params: NotaVersaoParamsDto
} = notaVersaoCrud;

export type NotaVersaoDto = NotaVersao;
type NotaVersaoMutationDto = CreateDto<NotaVersaoDto>;
export type CreateNotaVersaoDto = NotaVersaoMutationDto;
export type ReplaceNotaVersaoDto = NotaVersaoMutationDto;
export type UpdateNotaVersaoDto = UpdateDto<NotaVersaoDto>;
export type NotaVersaoParamsDto = InstanceType<typeof NotaVersaoParamsDto>;

export const NotaVersaoQueryDtoClass = createPagedFilterQueryDtoClass({
  name: "NotaVersaoQueryDto",
  filters: {
    sprint: { schema: t.integer({ minimum: 1 }), operator: "equals" },
    ativo: { schema: t.boolean(), operator: "equals" },
    mensagemContains: { schema: t.string({ minLength: 1 }), operator: "contains" }
  }
});

export interface NotaVersaoQueryDto {
  page?: number;
  pageSize?: number;
  sprint?: number;
  ativo?: boolean;
  mensagemContains?: string;
}

export const NotaVersaoPagedResponseDto = createPagedResponseDtoClass({
  name: "NotaVersaoPagedResponseDto",
  itemDto: NotaVersaoDto,
  description: "Paged nota versao list response."
});

export const NotaVersaoErrors = createCrudErrors("nota versao");
