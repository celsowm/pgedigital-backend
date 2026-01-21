import { createMetalCrudDtoClasses } from 'adorn-api';
import { NotaVersao } from '../../entities/NotaVersao';

const notaVersaoCrud = createMetalCrudDtoClasses(NotaVersao, {
  response: { description: 'Nota versão retornada pela API' },
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
