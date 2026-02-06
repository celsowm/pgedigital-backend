import {
  applyInput,
  HttpError,
} from "adorn-api";
import {
  type OrmSession,
  type ManyToManyCollection
} from "metal-orm";
import { withSession } from "../db/mssql";
import { Acervo } from "../entities/Acervo";
import type {
  AcervoDetailDto,
  AcervoQueryDto,
  CreateAcervoDto,
  ReplaceAcervoDto,
  UpdateAcervoDto,
  RaizCnpjInputDto
} from "../dtos/acervo/acervo.dtos";
import {
  AcervoRepository,
  ACERVO_FILTER_MAPPINGS,
  type AcervoFilterFields
} from "../repositories/acervo.repository";
import { BaseService, type ListConfig } from "./base.service";

const SORTABLE_COLUMNS = ["id", "nome", "ativo", "created", "modified"] as const;

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


  async create(input: CreateAcervoDto): Promise<AcervoDetailDto> {
    return withSession(async (session) => {
      const { classificacoes, temas, equipes_apoio, destinatarios, raizes_cnpjs, ...rest } =
        input as Record<string, unknown>;

      const acervo = new Acervo();
      applyInput(acervo, rest as Partial<Acervo>, { partial: false });
      await session.persist(acervo);
      await session.commit();

      await this.syncRelations(session, acervo, {
        classificacoes: classificacoes as number[] | undefined,
        temas: temas as number[] | undefined,
        equipes_apoio: equipes_apoio as number[] | undefined,
        destinatarios: destinatarios as number[] | undefined,
        raizes_cnpjs: raizes_cnpjs as RaizCnpjInputDto[] | undefined
      });
      await session.commit();

      const detail = await this.repository.getDetail(session, acervo.id);
      if (!detail) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      return detail;
    });
  }

  async replace(id: number, input: ReplaceAcervoDto): Promise<AcervoDetailDto> {
    return withSession(async (session) => {
      const acervo = await this.repository.findById(session, id);
      if (!acervo) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      const { classificacoes, temas, equipes_apoio, destinatarios, raizes_cnpjs, ...rest } =
        input as Record<string, unknown>;

      applyInput(acervo, rest as Partial<Acervo>, { partial: false });

      await this.syncRelations(session, acervo, {
        classificacoes: classificacoes as number[] | undefined,
        temas: temas as number[] | undefined,
        equipes_apoio: equipes_apoio as number[] | undefined,
        destinatarios: destinatarios as number[] | undefined,
        raizes_cnpjs: raizes_cnpjs as RaizCnpjInputDto[] | undefined
      }, { replace: true });
      await session.commit();

      const detail = await this.repository.getDetail(session, id);
      if (!detail) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      return detail;
    });
  }

  async update(id: number, input: UpdateAcervoDto): Promise<AcervoDetailDto> {
    return withSession(async (session) => {
      const acervo = await this.repository.findById(session, id);
      if (!acervo) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      const { classificacoes, temas, equipes_apoio, destinatarios, raizes_cnpjs, ...rest } =
        input as Record<string, unknown>;

      applyInput(acervo, rest as Partial<Acervo>, { partial: true });

      const hasRelations = classificacoes !== undefined || temas !== undefined ||
        equipes_apoio !== undefined || destinatarios !== undefined || raizes_cnpjs !== undefined;

      if (hasRelations) {
        await this.syncRelations(session, acervo, {
          classificacoes: classificacoes as number[] | undefined,
          temas: temas as number[] | undefined,
          equipes_apoio: equipes_apoio as number[] | undefined,
          destinatarios: destinatarios as number[] | undefined,
          raizes_cnpjs: raizes_cnpjs as RaizCnpjInputDto[] | undefined
        }, { replace: true });
      }
      await session.commit();

      const detail = await this.repository.getDetail(session, id);
      if (!detail) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      return detail;
    });
  }


  async remove(id: number): Promise<void> {
    return super.remove(id);
  }

  private async syncRelations(
    session: OrmSession,
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
    if (input.classificacoes !== undefined) {
      await this.syncIdCollection(acervo, "classificacoes", input.classificacoes, options.replace);
    }
    if (input.temas !== undefined) {
      await this.syncIdCollection(acervo, "temasRelacionados", input.temas, options.replace);
    }
    if (input.equipes_apoio !== undefined) {
      await this.syncIdCollection(acervo, "equipes", input.equipes_apoio, options.replace);
    }
    if (input.destinatarios !== undefined) {
      await this.syncIdCollection(acervo, "destinatarios", input.destinatarios, options.replace);
    }
    if (input.raizes_cnpjs !== undefined) {
      await this.syncRaizesCnpjs(acervo, input.raizes_cnpjs, options.replace);
    }
  }

  private async syncIdCollection(
    acervo: Acervo,
    relationName: "classificacoes" | "temasRelacionados" | "equipes" | "destinatarios",
    ids: number[],
    replace?: boolean
  ): Promise<void> {
    const collection = acervo[relationName] as ManyToManyCollection<unknown>;
    await collection.load();

    const incomingIds = new Set(ids.map(String));
    for (const id of ids) {
      collection.attach(id);
    }

    if (replace) {
      for (const existing of [...collection.getItems()]) {
        const existingId = (existing as Record<string, unknown>).id as number | string | undefined;
        if (existingId !== undefined && !incomingIds.has(String(existingId))) {
          collection.detach(existing);
        }
      }
    }
  }

  private async syncRaizesCnpjs(
    acervo: Acervo,
    items: RaizCnpjInputDto[],
    replace?: boolean
  ): Promise<void> {
    await acervo.raizesCNPJs.load();

    const incomingIds = new Set(items.map(item => String(item.id)));
    for (const item of items) {
      acervo.raizesCNPJs.attach(item.id, { raiz: item.raiz });
    }

    if (replace) {
      for (const existing of [...acervo.raizesCNPJs.getItems()]) {
        const existingId = (existing as unknown as Record<string, unknown>).id as number | string | undefined;
        if (existingId !== undefined && !incomingIds.has(String(existingId))) {
          acervo.raizesCNPJs.detach(existing);
        }
      }
    }
  }
}
