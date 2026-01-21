import { createPagedResponseDtoClass } from 'adorn-api';
import { NotaVersaoDto } from './nota-versao.dto';

export const NotaVersaoPagedResponseDto = createPagedResponseDtoClass({
  name: 'NotaVersaoPagedResponseDto',
  itemDto: NotaVersaoDto,
  description: 'Paged nota versão list response.',
});

export type NotaVersaoPagedResponseType = {
  items: NotaVersaoDto[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};
