import { HttpError, applyInput } from "adorn-api";
import {
  eq,
  createTreeManager,
  formatTreeList,
  getTableDefFromEntity,
  getTreeConfig,
  type OrmSession,
  threadResults,
  treeQuery
} from "metal-orm";
import { withSession } from "../db/mssql";
import { Tema } from "../entities/Tema";
import type {
  CreateTemaDto,
  ReplaceTemaDto,
  TemaDto,
  TemaQueryDto,
  TemaWithRelationsDto,
  TemaTreeQueryDto,
  UpdateTemaDto
} from "../dtos/tema/tema.dtos";
import {
  TemaRepository,
  TEMA_FILTER_MAPPINGS,
  type TemaFilterFields
} from "../repositories/tema.repository";
import { BaseService, type ListConfig } from "./base.service";

const SORTABLE_COLUMNS = ["id", "nome", "materia_id", "parent_id", "peso"] as const;

const temaTable = getTableDefFromEntity(Tema) ?? (() => {
  throw new Error("Tema entity metadata was not initialized.");
})();

const treeConfig = getTreeConfig(Tema) ?? {
  parentKey: "parent_id",
  leftKey: "lft",
  rightKey: "rght"
};

const tree = treeQuery(temaTable, treeConfig);

export class TemaService extends BaseService<Tema, TemaFilterFields, TemaQueryDto> {
  protected readonly repository: TemaRepository;
  protected readonly listConfig: ListConfig<Tema, TemaFilterFields> = {
    filterMappings: TEMA_FILTER_MAPPINGS,
    sortableColumns: [...SORTABLE_COLUMNS],
    defaultSortBy: "id",
    defaultSortOrder: "ASC"
  };
  private readonly entityName = "tema";

  constructor(repository?: TemaRepository) {
    super();
    this.repository = repository ?? new TemaRepository();
  }

  async listTree(query: TemaTreeQueryDto = {}): Promise<unknown> {
    return withSession(async (session) => {
      const rows = await this.loadTreeRows(session, query);
      const threaded = threadResults(rows, tree.config.leftKey, tree.config.rightKey);
      const depth = query.depth;
      if (depth !== undefined && depth !== null) {
        return this.limitThreadedDepth(threaded, depth);
      }
      return threaded;
    });
  }

  async listTreeList(query: TemaTreeQueryDto = {}): Promise<unknown> {
    return withSession(async (session) => {
      const rows = await this.loadTreeRows(session, query);
      const list = formatTreeList(rows, {
        keyPath: "id",
        valuePath: "nome",
        leftKey: tree.config.leftKey,
        rightKey: tree.config.rightKey
      });
      const depth = query.depth;
      if (depth !== undefined && depth !== null) {
        return list.filter((entry) => entry.depth <= depth);
      }
      return list;
    });
  }

  async getNode(id: number): Promise<unknown> {
    return withSession(async (session) => {
      const manager = createTreeManager(session, temaTable, tree.config);
      const node = await manager.getNode(id);
      if (!node) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      return node;
    });
  }

  async getOne(id: number): Promise<TemaWithRelationsDto> {
    return withSession(async (session) => {
      const tema = await this.repository.getWithRelations(session, id);
      if (!tema) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      return tema as TemaWithRelationsDto;
    });
  }

  async create(input: CreateTemaDto): Promise<TemaDto> {
    return withSession(async (session) => {
      const manager = createTreeManager(session, temaTable, tree.config);
      const parentId = (input as CreateTemaDto & { parent_id?: number | null }).parent_id ?? null;
      const data = { ...(input as Record<string, unknown>) };
      delete data.parent_id;
      const newId = await manager.insertAsChild(parentId, data);
      const resolvedId = typeof newId === "number" ? newId : Number(newId);
      if (!resolvedId || Number.isNaN(resolvedId)) {
        throw new HttpError(500, "Failed to create tema.");
      }
      const tema = await this.repository.findById(session, resolvedId);
      if (!tema) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      return tema as TemaDto;
    });
  }

  async replace(id: number, input: ReplaceTemaDto): Promise<TemaDto> {
    return withSession(async (session) => {
      const tema = await this.repository.findById(session, id);
      if (!tema) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }

      await this.moveIfNeeded(session, id, input as Partial<Tema>);

      applyInput(tema, input as Partial<Tema>, { partial: false });
      await session.commit();

      const reloaded = await this.repository.findById(session, id);
      if (!reloaded) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      return reloaded as TemaDto;
    });
  }

  async update(id: number, input: UpdateTemaDto): Promise<TemaDto> {
    return withSession(async (session) => {
      const tema = await this.repository.findById(session, id);
      if (!tema) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }

      await this.moveIfNeeded(session, id, input as Partial<Tema>);

      applyInput(tema, input as Partial<Tema>, { partial: true });
      await session.commit();

      const reloaded = await this.repository.findById(session, id);
      if (!reloaded) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      return reloaded as TemaDto;
    });
  }

  async remove(id: number): Promise<void> {
    return withSession(async (session) => {
      const manager = createTreeManager(session, temaTable, tree.config);
      const node = await manager.getNode(id);
      if (!node) {
        throw new HttpError(404, `${this.entityName} not found.`);
      }
      await manager.deleteSubtree(node);
    });
  }

  private async moveIfNeeded(
    session: OrmSession,
    id: number,
    input: Partial<Tema>
  ): Promise<void> {
    if (!Object.prototype.hasOwnProperty.call(input, "parent_id")) {
      return;
    }

    const manager = createTreeManager(session, temaTable, tree.config);
    const node = await manager.getNode(id);
    if (!node) {
      throw new HttpError(404, `${this.entityName} not found.`);
    }

    const currentParentId = node.parentId ?? null;
    const nextParentId = input.parent_id ?? null;
    if (currentParentId === nextParentId) {
      return;
    }

    await manager.moveTo(node, nextParentId);
  }

  private async loadTreeRows(
    session: OrmSession,
    query: TemaTreeQueryDto
  ): Promise<Record<string, unknown>[]> {
    const rootId = query.rootId ?? null;
    let qb = rootId !== null
      ? await this.createSubtreeQuery(session, rootId)
      : tree.findTreeList();

    if (query.materiaId !== undefined && query.materiaId !== null) {
      qb = qb.where(eq(temaTable.columns.materia_id, query.materiaId));
    }

    return (await qb.execute(session)) as Record<string, unknown>[];
  }

  private async createSubtreeQuery(session: OrmSession, rootId: number) {
    const manager = createTreeManager(session, temaTable, tree.config);
    const node = await manager.getNode(rootId);
    if (!node) {
      throw new HttpError(404, `${this.entityName} not found.`);
    }
    return tree.findSubtree({ lft: node.lft, rght: node.rght });
  }

  private limitThreadedDepth<T extends { children: T[] }>(
    nodes: T[],
    maxDepth: number,
    currentDepth: number = 0
  ): T[] {
    if (maxDepth < 0) {
      return [];
    }

    return nodes.map((node) => {
      if (currentDepth >= maxDepth) {
        return { ...node, children: [] };
      }
      return {
        ...node,
        children: this.limitThreadedDepth(node.children ?? [], maxDepth, currentDepth + 1)
      };
    });
  }
}
