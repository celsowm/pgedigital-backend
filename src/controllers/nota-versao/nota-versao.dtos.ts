import {
  Errors,
  createMetalCrudDtoClasses,
  createPagedResponseDtoClass,
  createPagedFilterQueryDtoClass,
  SimpleErrorDto,
  t,
} from 'adorn-api';
import { NotaVersao } from '../../entities/NotaVersao.js';

const notaVersaoCrud = createMetalCrudDtoClasses(NotaVersao, {
  response: { description: 'Nota de versão retornada pela API.' },
  mutationExclude: ['id', 'data_exclusao', 'data_inativacao'],
});

export const {
  response: NotaVersaoDto,
  create: CreateNotaVersaoDto,
  replace: ReplaceNotaVersaoDto,
  update: UpdateNotaVersaoDto,
  params: NotaVersaoParamsDto,
} = notaVersaoCrud;

export type NotaVersaoDto = InstanceType<typeof NotaVersaoDto>;
export type CreateNotaVersaoDto = InstanceType<typeof CreateNotaVersaoDto>;
export type ReplaceNotaVersaoDto = InstanceType<typeof ReplaceNotaVersaoDto>;
export type UpdateNotaVersaoDto = InstanceType<typeof UpdateNotaVersaoDto>;
export type NotaVersaoParamsDto = InstanceType<typeof NotaVersaoParamsDto>;

export const NotaVersaoQueryDtoClass = createPagedFilterQueryDtoClass({
  name: 'NotaVersaoQueryDto',
  filters: {
    sprint: { schema: t.integer({ minimum: 1 }), operator: 'equals' },
    ativo: { schema: t.boolean(), operator: 'equals' },
    mensagemContains: { schema: t.string({ minLength: 1 }), operator: 'contains' },
  },
});

export interface NotaVersaoQueryDto {
  page?: number;
  pageSize?: number;
  sprint?: number;
  ativo?: boolean;
  mensagemContains?: string;
}

export const NotaVersaoPagedResponseDto = createPagedResponseDtoClass({
  name: 'NotaVersaoPagedResponseDto',
  itemDto: NotaVersaoDto,
  description: 'Lista paginada de notas de versão.',
});

export const NotaVersaoErrors = Errors(SimpleErrorDto, [
  { status: 400, description: 'ID inválido.' },
  { status: 404, description: 'Nota de versão não encontrada.' },
]);
