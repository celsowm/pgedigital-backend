import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../../src/app";

const REQUIRED_ENV = [
  "PGE_DIGITAL_HOST",
  "PGE_DIGITAL_USER",
  "PGE_DIGITAL_PASSWORD",
  "PGE_DIGITAL_ENCRYPT",
  "PGE_DIGITAL_TRUST_CERT",
  "PGE_DIGITAL_DATABASE"
] as const;

const hasDbEnv = REQUIRED_ENV.every((name) => !!process.env[name]);
const describeDb = hasDbEnv ? describe : describe.skip;

describeDb("Especializada database reads", () => {
  let app: Awaited<ReturnType<typeof createApp>>;

  beforeAll(async () => {
    app = await createApp();
  });

  it("filters by nomeContains", async () => {
    const needle = "a";
    const response = await request(app).get(`/especializada?page=1&pageSize=10&nomeContains=${needle}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({
      items: expect.any(Array),
      page: 1,
      pageSize: 10,
      totalItems: expect.any(Number),
      totalPages: expect.any(Number)
    }));

    const items = response.body.items as Array<{ nome?: string }>;
    for (const item of items) {
      expect(typeof item.nome).toBe("string");
      expect(item.nome?.toLowerCase()).toContain(needle);
    }
  });

  it("filters by responsavelNomeContains", async () => {
    const needle = "a";
    const response = await request(app).get(`/especializada?page=1&pageSize=10&responsavelNomeContains=${needle}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({
      items: expect.any(Array),
      page: 1,
      pageSize: 10,
      totalItems: expect.any(Number),
      totalPages: expect.any(Number)
    }));

    const items = response.body.items as Array<{ responsavel?: { nome?: string } }>;
    if (items.length > 0) {
      for (const item of items) {
        expect(item.responsavel).toBeDefined();
        expect(item.responsavel?.nome?.toLowerCase()).toContain(needle);
      }
    }
  });
});
