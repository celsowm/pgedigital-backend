import request from "supertest";
import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("../../src/db/mssql", () => ({
  withSession: vi.fn(),
  testMssqlConnection: vi.fn(async () => ({ ok: true }))
}));

import { createApp } from "../../src/app";

describe("App smoke", () => {
  let app: Awaited<ReturnType<typeof createApp>>;

  beforeAll(async () => {
    app = await createApp();
  });

  it("serves OpenAPI docs", async () => {
    const response = await request(app).get("/docs");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("text/html");
  });

  it("serves OpenAPI JSON", async () => {
    const response = await request(app).get("/openapi.json");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("openapi");
    expect(response.body).toHaveProperty("paths");
  });
});