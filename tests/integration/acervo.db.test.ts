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

describeDb("Acervo database reads", () => {
  let app: Awaited<ReturnType<typeof createApp>>;

  beforeAll(async () => {
    app = await createApp();
  });

  it("filters by nomeContains", async () => {
    const needle = "cadeira";
    const response = await request(app).get(`/acervo?page=1&pageSize=25&nomeContains=${needle}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({
      items: expect.any(Array),
      page: 1,
      pageSize: 25,
      totalItems: expect.any(Number),
      totalPages: expect.any(Number)
    }));

    const items = response.body.items as Array<{ nome?: string }>;
    for (const item of items) {
      expect(typeof item.nome).toBe("string");
      expect(item.nome?.toLowerCase()).toContain(needle);
    }
  });

  it("filters by procuradorTitularNomeContains", async () => {
    const seedResponse = await request(app).get("/acervo?page=1&pageSize=25");

    expect(seedResponse.status).toBe(200);
    const seedItems = seedResponse.body.items as Array<{
      procuradorTitular?: { id?: number; nome?: string };
    }>;
    expect(Array.isArray(seedItems)).toBe(true);
    expect(seedItems.length).toBeGreaterThan(0);

    const sample = seedItems.find((item) => typeof item.procuradorTitular?.nome === "string");
    if (!sample?.procuradorTitular?.nome) {
      return;
    }

    const baseName = sample.procuradorTitular.nome.trim();
    if (!baseName) {
      return;
    }
    const rawNeedle = baseName.slice(0, 3) || baseName;
    const needle = encodeURIComponent(rawNeedle);
    const response = await request(app).get(`/acervo?page=1&pageSize=25&procuradorTitularNomeContains=${needle}`);

    expect(response.status).toBe(200);
    const items = response.body.items as Array<{
      procuradorTitular?: { nome?: string };
    }>;
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      expect(typeof item.procuradorTitular?.nome).toBe("string");
      expect(item.procuradorTitular?.nome?.toLowerCase()).toContain(rawNeedle.toLowerCase());
    }
  });

  it("filters by procuradorTitularId", async () => {
    const seedResponse = await request(app).get("/acervo?page=1&pageSize=25");

    expect(seedResponse.status).toBe(200);
    const seedItems = seedResponse.body.items as Array<{
      procuradorTitular?: { id?: number };
    }>;
    expect(Array.isArray(seedItems)).toBe(true);
    expect(seedItems.length).toBeGreaterThan(0);

    const sample = seedItems.find((item) => typeof item.procuradorTitular?.id === "number");
    if (!sample?.procuradorTitular?.id) {
      return;
    }

    const procuradorTitularId = sample.procuradorTitular.id;
    const response = await request(app).get(
      `/acervo?page=1&pageSize=25&procuradorTitularId=${procuradorTitularId}`
    );

    expect(response.status).toBe(200);
    const items = response.body.items as Array<{
      procuradorTitular?: { id?: number };
    }>;
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      expect(item.procuradorTitular?.id).toBe(procuradorTitularId);
    }
  });
});
