import type { OrmSession } from 'metal-orm';
import { selectFromEntity, entityRef, eq, and, isNull, isNotNull } from 'metal-orm';
import { NotaVersao } from '../entities/NotaVersao';

export interface NotaVersaoFilters {
  dataEquals?: Date;
  dataGte?: Date;
  dataLte?: Date;
  sprintEquals?: number;
  sprintGte?: number;
  sprintLte?: number;
  ativoEquals?: boolean;
  mensagemContains?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  includeDeleted?: boolean;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface NotaVersaoListParams {
  filters?: NotaVersaoFilters;
  pagination: PaginationParams;
}

export class NotaVersaoRepository {
  constructor(private session: OrmSession) {}

  async findById(id: number, includeDeleted = false): Promise<NotaVersao | undefined> {
    const NV = entityRef(NotaVersao);
    const [nota] = await selectFromEntity(NotaVersao)
      .where(eq(NV.id, id))
      .execute(this.session);

    if (!nota) {
      return undefined;
    }

    if (!includeDeleted && this.isDeletedOrInactive(nota)) {
      return undefined;
    }

    return nota;
  }

  async findAll(params: NotaVersaoListParams): Promise<{
    items: NotaVersao[];
    total: number;
  }> {
    const { filters = {}, pagination } = params;
    const { page, pageSize } = pagination;
    const NV = entityRef(NotaVersao);

    let query = selectFromEntity(NotaVersao);

    const whereConditions: any[] = [];

    if (!filters.includeDeleted) {
      whereConditions.push(
        and(
          isNull(NV.data_exclusao),
          isNull(NV.data_inativacao)
        )
      );
    }

    if (filters.dataEquals) {
      whereConditions.push(eq(NV.data, filters.dataEquals));
    }

    if (filters.mensagemContains) {
      whereConditions.push(
        NV.mensagem as any
      );
    }

    if (filters.sprintEquals) {
      whereConditions.push(eq(NV.sprint, filters.sprintEquals));
    }

    if (filters.ativoEquals !== undefined) {
      whereConditions.push(eq(NV.ativo, filters.ativoEquals));
    }

    if (whereConditions.length > 0) {
      query = query.where(and(...whereConditions) as any);
    }

    if (filters.sortBy) {
      const sortField = (NV as any)[filters.sortBy];
      if (sortField) {
        query = query.orderBy(sortField, filters.sortOrder || 'ASC');
      }
    } else {
      query = query.orderBy(NV.id, 'ASC');
    }

    const offset = (page - 1) * pageSize;
    query = query.limit(pageSize).offset(offset);

    const [items, total] = await Promise.all([
      query.execute(this.session),
      selectFromEntity(NotaVersao)
        .where(whereConditions.length > 0 ? and(...whereConditions) as any : undefined)
        .count(this.session),
    ]);

    return {
      items: filters.includeDeleted ? items : items.filter(item => !this.isDeletedOrInactive(item)),
      total,
    };
  }

  async create(notaVersao: NotaVersao): Promise<void> {
    this.session.persist(notaVersao);
  }

  async update(notaVersao: NotaVersao): Promise<void> {
    this.session.persist(notaVersao);
  }

  async softDelete(id: number): Promise<void> {
    const nota = await this.findById(id);
    if (!nota) {
      throw new Error('NotaVersao not found');
    }
    nota.data_exclusao = new Date();
    this.session.persist(nota);
  }

  async softInactivate(id: number): Promise<void> {
    const nota = await this.findById(id);
    if (!nota) {
      throw new Error('NotaVersao not found');
    }
    nota.data_inativacao = new Date();
    this.session.persist(nota);
  }

  async restore(id: number): Promise<void> {
    const nota = await this.findById(id, true);
    if (!nota) {
      throw new Error('NotaVersao not found');
    }
    nota.data_exclusao = undefined;
    nota.data_inativacao = undefined;
    this.session.persist(nota);
  }

  async hardDelete(id: number): Promise<void> {
    const nota = await this.findById(id, true);
    if (!nota) {
      throw new Error('NotaVersao not found');
    }
    this.session.remove(nota);
  }

  async count(filters?: NotaVersaoFilters): Promise<number> {
    const NV = entityRef(NotaVersao);
    let query = selectFromEntity(NotaVersao);

    const whereConditions: any[] = [];

    if (!filters?.includeDeleted) {
      whereConditions.push(
        and(
          isNull(NV.data_exclusao),
          isNull(NV.data_inativacao)
        )
      );
    }

    if (filters) {
      if (filters.dataEquals) {
        whereConditions.push(eq(NV.data, filters.dataEquals));
      }
      if (filters.sprintEquals) {
        whereConditions.push(eq(NV.sprint, filters.sprintEquals));
      }
      if (filters.ativoEquals !== undefined) {
        whereConditions.push(eq(NV.ativo, filters.ativoEquals));
      }
    }

    if (whereConditions.length > 0) {
      query = query.where(and(...whereConditions) as any);
    }

    return query.count(this.session);
  }

  private isDeletedOrInactive(notaVersao: NotaVersao): boolean {
    return notaVersao.data_exclusao !== undefined || notaVersao.data_inativacao !== undefined;
  }
}
