import request from "supertest";
import { beforeAll, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  withSession: vi.fn(() => {
    throw new Error("withSession should not be called for validation failures");
  }),
  testMssqlConnection: vi.fn()
}));

vi.mock("../../src/db/mssql", () => ({
  withSession: mocks.withSession,
  testMssqlConnection: mocks.testMssqlConnection
}));

import { createApp } from "../../src/app";

describe("Materia DTO validation", () => {
  let app: Awaited<ReturnType<typeof createApp>>;

  beforeAll(async () => {
    app = await createApp();
  });

  it("rejects invalid id param on GET /materia/:id", async () => {
    const response = await request(app).get("/materia/not-a-number");

    expect(response.status).toBe(400);
    expect(response.body).toEqual(expect.objectContaining({
      message: "Validation failed",
      errors: expect.any(Array)
    }));
  });

  it("rejects invalid pagination on GET /materia", async () => {
    const response = await request(app).get("/materia?page=0&pageSize=5000");

    expect(response.status).toBe(400);
    expect(response.body).toEqual(expect.objectContaining({
      message: "Validation failed",
      errors: expect.any(Array)
    }));
  });
});
