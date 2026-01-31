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

const allowWrites = process.env.PGE_DIGITAL_TEST_ALLOW_WRITE === "true";
const describeWrite = hasDbEnv && allowWrites ? describe : describe.skip;

describeDb("Materia database reads", () => {
  let app: Awaited<ReturnType<typeof createApp>>;

  beforeAll(async () => {
    app = await createApp();
  });

  it("supports pagination and filter query", async () => {
    const response = await request(app).get("/materia?page=1&pageSize=5&nomeContains=a");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({
      items: expect.any(Array),
      page: 1,
      pageSize: 5,
      totalItems: expect.any(Number),
      totalPages: expect.any(Number)
    }));
  });
});

describeWrite("Materia database CRUD", () => {
  let app: Awaited<ReturnType<typeof createApp>>;
  let createdId: number;
  const baseName = `Vitest Materia ${Date.now()}`;

  beforeAll(async () => {
    app = await createApp();
  });

  it("creates a materia", async () => {
    const response = await request(app).post("/materia").send({ nome: baseName });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(expect.objectContaining({
      id: expect.any(Number),
      nome: baseName
    }));

    createdId = response.body.id;
  });

  it("reads the created materia", async () => {
    const response = await request(app).get(`/materia/${createdId}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({
      id: createdId,
      nome: baseName
    }));
  });

  it("updates the materia", async () => {
    const updatedName = `${baseName} Updated`;
    const response = await request(app).patch(`/materia/${createdId}`).send({ nome: updatedName });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({
      id: createdId,
      nome: updatedName
    }));
  });

  it("deletes the materia", async () => {
    const response = await request(app).delete(`/materia/${createdId}`);

    expect(response.status).toBe(204);
  });
});