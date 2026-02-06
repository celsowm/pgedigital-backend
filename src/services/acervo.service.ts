import { applyInput, HttpError } from "adorn-api";
import { type OrmSession } from "metal-orm";
import { withSession } from "../db/mssql";
import { Acervo } from "../entities/Acervo";
import type {
  AcervoDetailDto,
  AcervoQueryDto,
  CreateAcervoDto,
  RaizCnpjInputDto,
  ReplaceAcervoDto,
  UpdateAcervoDto
} from "../dtos/acervo/acervo.dtos";
import {
  AcervoRepository,
  ACERVO_FILTER_MAPPINGS
} from "../repositories/acervo.repository";
import { BaseService, type ListConfig } from "./base.service";

const SORTABLE_COLUMNS = ["id", "nome", "procurador_titular_id"] as const;

export class AcervoService extends BaseService<
  Acervo,
  AcervoQueryDto,
  AcervoDetailDto,
  CreateAcervoDto,
  ReplaceAcervoDto,
  UpdateAcervoDto
> {
  protected readonly repository: AcervoRepository;
  protected readonly listConfig: ListConfig<Acervo> = {
    filterMappings: ACERVO_FILTER_MAPPINGS,
    sortableColumns: [...SORTABLE_COLUMNS],
    defaultSortBy: "id",
    defaultSortOrder: "ASC"
  };

  protected readonly entityName = "acervo";

  constructor(repository?: AcervoRepository) {
    super();
    this.repository = repository ?? new AcervoRepository();
  }

  override async create(input: CreateAcervoDto): Promise<AcervoDetailDto> {
    return withSession(async (session) => {
      const acervo = new Acervo();
      applyInput(acervo, input as Partial<Acervo>, { partial: false });
      await session.persist(acervo);
      await this.syncRelations(acervo, input);
      await session.commit();

      return (await this.repository.getDetail(session, acervo.id)) as AcervoDetailDto;
    });
  }

  override async replace(id: number, input: ReplaceAcervoDto): Promise<AcervoDetailDto> {
    return withSession(async (session) => {
      const acervo = await this.repository.findById(session, id);
      if (!acervo) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      applyInput(acervo, input as Partial<Acervo>, { partial: false });
      await this.syncRelations(acervo, input, { replace: true });
      await session.commit();

      return (await this.repository.getDetail(session, id)) as AcervoDetailDto;
    });
  }

  override async update(id: number, input: UpdateAcervoDto): Promise<AcervoDetailDto> {
    return withSession(async (session) => {
      const acervo = await this.repository.findById(session, id);
      if (!acervo) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      applyInput(acervo, input as Partial<Acervo>, { partial: true });
      await this.syncRelations(acervo, input);
      await session.commit();

      return (await this.repository.getDetail(session, id)) as AcervoDetailDto;
    });
  }

  private async syncRelations(
    acervo: Acervo,
    input: {
      classificacoes?: number[];
      temas?: number[];
      equipes_apoio?: number[];
      destinatarios?: number[];
      raizes_cnpjs?: RaizCnpjInputDto[];
    },
    options: { replace?: boolean } = {}
  ): Promise<void> {
    const syncTasks: Promise<void>[] = [];

    if (input.classificacoes !== undefined) {
      syncTasks.push(this.syncCollection(acervo.classificacoes, input.classificacoes, options));
    }
    if (input.temas !== undefined) {
      syncTasks.push(this.syncCollection(acervo.temasRelacionados, input.temas, options));
    }
    if (input.equipes_apoio !== undefined) {
      syncTasks.push(this.syncCollection(acervo.equipes, input.equipes_apoio, options));
    }
    if (input.destinatarios !== undefined) {
      syncTasks.push(this.syncCollection(acervo.destinatarios, input.destinatarios, options));
    }
    if (input.raizes_cnpjs !== undefined) {
      const items = input.raizes_cnpjs.map(item => ({ id: item.id, pivot: { raiz: item.raiz } }));
      syncTasks.push(this.syncCollection(acervo.raizesCNPJs, items, options));
    }

    await Promise.all(syncTasks);
  }
}
