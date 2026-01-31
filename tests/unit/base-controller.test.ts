import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  mockSelectFromEntity: vi.fn(),
  mockApplyFilter: vi.fn(),
  mockToPagedResponse: vi.fn(),
  mockParsePagination: vi.fn(),
  mockParseFilter: vi.fn(),
  mockWithSession: vi.fn()
}));

vi.mock("metal-orm", () => ({
  selectFromEntity: mocks.mockSelectFromEntity,
  applyFilter: mocks.mockApplyFilter,
  toPagedResponse: mocks.mockToPagedResponse
}));

vi.mock("adorn-api", async () => {
  const actual = await vi.importActual<any>("adorn-api");
  return {
    ...actual,
    parsePagination: mocks.mockParsePagination,
    parseFilter: mocks.mockParseFilter
  };
});

vi.mock("../../src/db/mssql", () => ({
  withSession: mocks.mockWithSession
}));

import { BaseController } from "../../src/utils/base-controller";

class ExampleEntity {
  id!: number;
  nome!: string;
}

const ExampleRef = { id: "id", nome: "nome" };

type ExampleFilterFields = "nome";

class ExampleController extends BaseController<ExampleEntity, ExampleFilterFields> {
  get entityClass() {
    return ExampleEntity;
  }

  get entityRef() {
    return ExampleRef;
  }

  get filterMappings() {
    return { nomeContains: { field: "nome", operator: "contains" } } as const;
  }

  get entityName() {
    return "example";
  }
}

describe("BaseController", () => {
  const controller = new ExampleController();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("list applies pagination, filters, and returns paged response", async () => {
    const session = { sessionId: "mock" };
    mocks.mockWithSession.mockImplementation(async (handler: any) => handler(session));

    const executePaged = vi.fn().mockResolvedValue({ rows: [{ id: 1 }] });
    const query: { orderBy: ReturnType<typeof vi.fn>; executePaged: typeof executePaged } = {
      orderBy: vi.fn(),
      executePaged
    };
    query.orderBy.mockReturnValue(query);

    mocks.mockSelectFromEntity.mockReturnValue(query);
    mocks.mockApplyFilter.mockImplementation((input) => input);
    mocks.mockParsePagination.mockReturnValue({ page: 2, pageSize: 10 });
    mocks.mockParseFilter.mockReturnValue([{ field: "nome", operator: "contains", value: "abc" }]);
    mocks.mockToPagedResponse.mockReturnValue({ items: [{ id: 1 }], page: 2, pageSize: 10 });

    const result = await controller.list({ query: { page: 2, pageSize: 10 } } as any);

    expect(mocks.mockSelectFromEntity).toHaveBeenCalledWith(ExampleEntity);
    expect(query.orderBy).toHaveBeenCalledWith(ExampleRef.id, "ASC");
    expect(mocks.mockApplyFilter).toHaveBeenCalledWith(query, ExampleEntity, [
      { field: "nome", operator: "contains", value: "abc" }
    ]);
    expect(executePaged).toHaveBeenCalledWith(session, { page: 2, pageSize: 10 });
    expect(result).toEqual({ items: [{ id: 1 }], page: 2, pageSize: 10 });
  });

  it("listOptions returns id and label field", async () => {
    const session = { sessionId: "mock" };
    mocks.mockWithSession.mockImplementation(async (handler: any) => handler(session));

    const executePlain = vi.fn().mockResolvedValue([{ id: 1, nome: "A" }]);
    const orderBy = vi.fn().mockReturnThis();
    const select = vi.fn().mockReturnThis();

    mocks.mockSelectFromEntity.mockReturnValue({ select, orderBy, executePlain });

    const result = await controller.listOptions();

    expect(select).toHaveBeenCalledWith({ id: ExampleRef.id, nome: ExampleRef.nome });
    expect(orderBy).toHaveBeenCalledWith(ExampleRef.nome, "ASC");
    expect(executePlain).toHaveBeenCalledWith(session);
    expect(result).toEqual([{ id: 1, nome: "A" }]);
  });

  it("delete removes entity and commits", async () => {
    const entity = { id: 1 };
    const session = {
      find: vi.fn().mockResolvedValue(entity),
      remove: vi.fn().mockResolvedValue(undefined),
      commit: vi.fn().mockResolvedValue(undefined)
    };

    await controller.delete(session as any, 1);

    expect(session.find).toHaveBeenCalledWith(ExampleEntity, 1);
    expect(session.remove).toHaveBeenCalledWith(entity);
    expect(session.commit).toHaveBeenCalled();
  });

  it("delete throws 404 when entity missing", async () => {
    const session = {
      find: vi.fn().mockResolvedValue(undefined)
    };

    await expect(controller.delete(session as any, 999)).rejects.toMatchObject({
      status: 404,
      message: "example not found."
    });
  });

  it("getEntityOrThrow returns entity when found", async () => {
    const entity = { id: 2 };
    const session = {
      find: vi.fn().mockResolvedValue(entity)
    };

    await expect(controller.getEntityOrThrow(session as any, 2)).resolves.toBe(entity);
  });

  it("getEntityOrThrow throws 404 when missing", async () => {
    const session = {
      find: vi.fn().mockResolvedValue(undefined)
    };

    await expect(controller.getEntityOrThrow(session as any, 404)).rejects.toMatchObject({
      status: 404,
      message: "example not found."
    });
  });
});
