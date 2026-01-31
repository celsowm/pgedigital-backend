import request from "supertest";
import { beforeAll, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  withSession: vi.fn(),
  testMssqlConnection: vi.fn(async () => ({ ok: true }))
}));

vi.mock("../../src/db/mssql", () => ({
  withSession: mocks.withSession,
  testMssqlConnection: mocks.testMssqlConnection
}));

import { createApp } from "../../src/app";

describe("Test DTO validation", () => {
  let app: Awaited<ReturnType<typeof createApp>>;

  beforeAll(async () => {
    app = await createApp();
  });

  it("rejects empty body on POST /tests", async () => {
    const response = await request(app).post("/tests").send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual(expect.objectContaining({
      message: "Validation failed",
      errors: expect.any(Array)
    }));
  });

  it("rejects invalid id param on GET /tests/:id", async () => {
    const response = await request(app).get("/tests/not-a-uuid");

    expect(response.status).toBe(400);
    expect(response.body).toEqual(expect.objectContaining({
      message: "Validation failed",
      errors: expect.any(Array)
    }));
  });
});