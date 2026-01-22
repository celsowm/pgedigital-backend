import { applyFilter, toPagedResponse, entityRef, selectFromEntity, isNull } from 'metal-orm';
import type { SimpleWhereInput } from 'metal-orm';
import { getOrm } from '../../database/connection.js';
import { NotaVersao } from '../../entities/NotaVersao.js';
import type { NotaVersaoQueryDto } from './nota-versao.dtos.js';

const notaVersaoRef = entityRef(NotaVersao);

type NotaVersaoFilter = SimpleWhereInput<typeof NotaVersao, 'sprint' | 'ativo' | 'mensagem'>;

export function createSession() {
  return getOrm().createSession();
}

export type Session = ReturnType<typeof createSession>;

function buildNotaVersaoFilter(query?: NotaVersaoQueryDto): NotaVersaoFilter | undefined {
  if (!query) {
    return undefined;
  }
  const filter: NotaVersaoFilter = {};
  if (query.sprint !== undefined) {
    filter.sprint = { equals: query.sprint };
  }
  if (query.ativo !== undefined) {
    filter.ativo = { equals: query.ativo };
  }
  if (query.mensagemContains) {
    filter.mensagem = { contains: query.mensagemContains };
  }
  return Object.keys(filter).length ? filter : undefined;
}

export class NotaVersaoRepository {
  constructor(private session: Session) {}

  async findById(id: number): Promise<NotaVersao | null> {
    return this.session.find(NotaVersao, id);
  }

  async findPaged(query?: NotaVersaoQueryDto, page = 1, pageSize = 20) {
    const filters = buildNotaVersaoFilter(query);
    const queryBuilder = applyFilter(
      selectFromEntity(NotaVersao)
        .where(isNull(notaVersaoRef.data_exclusao))
        .orderBy(notaVersaoRef.id, 'DESC'),
      NotaVersao,
      filters
    );
    const paged = await queryBuilder.executePaged(this.session, { page, pageSize });
    return toPagedResponse(paged);
  }

  async persist(entity: NotaVersao): Promise<void> {
    await this.session.persist(entity);
  }

  async commit(): Promise<void> {
    await this.session.commit();
  }
}
