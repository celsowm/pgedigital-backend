import request from "supertest";
import { beforeAll, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  testMssqlConnection: vi.fn(async () => ({ ok: true, databaseName: "mock-db" })),
  withSession: vi.fn()
}));

vi.mock("../../src/db/mssql", () => ({
  withSession: mocks.withSession,
  testMssqlConnection: mocks.testMssqlConnection
}));

import { createApp } from "../../src/app";

describe("TestController contract", () => {
  let app: Awaited<ReturnType<typeof createApp>>;

  beforeAll(async () => {
    app = await createApp();
  });

  it("GET /tests returns sample list", async () => {
    const response = await request(app).get("/tests");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("tests");
    expect(Array.isArray(response.body.tests)).toBe(true);
    expect(response.body.tests[0]).toEqual(expect.objectContaining({
      id: expect.any(String),
      name: expect.any(String)
    }));
  });

  it("GET /tests/:id returns requested test", async () => {
    const response = await request(app).get("/tests/550e8400-e29b-41d4-a716-446655440099");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: "550e8400-e29b-41d4-a716-446655440099",
      name: "Sample Test",
      description: "A sample test record"
    });
  });

  it("POST /tests creates a test", async () => {
    const payload = { name: "Vitest", description: "Created in test" };
    const response = await request(app).post("/tests").send(payload);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(expect.objectContaining({
      id: expect.any(String),
      name: payload.name,
      description: payload.description
    }));
  });

  it("GET /tests/db-connection returns mocked result", async () => {
    const response = await request(app).get("/tests/db-connection");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true, databaseName: "mock-db" });
  });
});
