import { createPagedFilterQueryDtoClass, t } from 'adorn-api';

export const NotaVersaoFilterDtoClass = createPagedFilterQueryDtoClass({
  name: 'NotaVersaoFilterDto',
  filters: {
    dataEquals: { schema: t.dateTime(), operator: 'equals' },
    dataGte: { schema: t.dateTime(), operator: 'gte' },
    dataLte: { schema: t.dateTime(), operator: 'lte' },
    sprintEquals: { schema: t.integer({ minimum: 1 }), operator: 'equals' },
    sprintGte: { schema: t.integer({ minimum: 1 }), operator: 'gte' },
    sprintLte: { schema: t.integer({ minimum: 1 }), operator: 'lte' },
    ativoEquals: { schema: t.boolean(), operator: 'equals' },
    mensagemContains: { schema: t.string({ minLength: 1 }), operator: 'contains' },
  },
});

export type NotaVersaoFilterDto = InstanceType<typeof NotaVersaoFilterDtoClass> & {
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  includeDeleted?: boolean;
};
