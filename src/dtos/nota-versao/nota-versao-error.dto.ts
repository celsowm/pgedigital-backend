import { Errors, StandardErrorDto, SimpleErrorDto } from 'adorn-api';

export const NotaVersaoErrors = Errors(StandardErrorDto, [
  { status: 400, description: 'Invalid nota versão id.' },
  { status: 404, description: 'Nota versão not found.' },
  { status: 400, description: 'Invalid data format.' },
  { status: 400, description: 'Invalid sprint value.' },
  { status: 400, description: 'Invalid message length.' },
  { status: 400, description: 'Cannot modify soft-deleted record.' },
  { status: 400, description: 'Invalid filter parameters.' },
]);

export const NotaVersaoSimpleErrors = Errors(SimpleErrorDto, [
  { status: 400, description: 'Invalid nota versão id.' },
  { status: 404, description: 'Nota versão not found.' },
]);
