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

describeDb("Feriado database reads", () => {
  let app: Awaited<ReturnType<typeof createApp>>;

  beforeAll(async () => {
    app = await createApp();
  });

  it("supports pagination and filter query", async () => {
    const response = await request(app).get("/feriado?page=1&pageSize=5");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({
      items: expect.any(Array),
      page: 1,
      pageSize: 5,
      totalItems: expect.any(Number),
      totalPages: expect.any(Number)
    }));
  });

  it("supports filtering by data_inicio and data_fim", async () => {
    const response = await request(app).get(
      "/feriado?page=1&pageSize=5&dataInicioGte=2024-01-01&dataFimLte=2024-12-31"
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({
      items: expect.any(Array)
    }));
  });

  it("supports filtering by descricao", async () => {
    const response = await request(app).get(
      "/feriado?page=1&pageSize=5&descricaoContains=natal"
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({
      items: expect.any(Array)
    }));
  });
});

describeWrite("Feriado database CRUD", () => {
  let app: Awaited<ReturnType<typeof createApp>>;
  let createdId: number;
  const baseDescricao = `Vitest Feriado ${Date.now()}`;
  const baseDataInicio = "2026-01-01";

  beforeAll(async () => {
    app = await createApp();
  });

  it("creates a feriado (data_fim defaults to data_inicio)", async () => {
    const response = await request(app).post("/feriado").send({
      data_inicio: baseDataInicio,
      descricao: baseDescricao
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(expect.objectContaining({
      id: expect.any(Number),
      descricao: baseDescricao
    }));

    createdId = response.body.id;
  });

  it("reads the created feriado with tribunal data", async () => {
    const response = await request(app).get(`/feriado/${createdId}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({
      id: createdId,
      descricao: baseDescricao
    }));
  });

  it("rejects create when data_fim < data_inicio", async () => {
    const response = await request(app).post("/feriado").send({
      data_inicio: "2026-12-31",
      data_fim: "2026-01-01",
      descricao: "Feriado inválido"
    });

    expect(response.status).toBe(400);
  });

  it("updates the feriado", async () => {
    const updatedDescricao = `${baseDescricao} Updated`;
    const response = await request(app).patch(`/feriado/${createdId}`).send({ descricao: updatedDescricao });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({
      id: createdId,
      descricao: updatedDescricao
    }));
  });

  it("deletes the feriado", async () => {
    const response = await request(app).delete(`/feriado/${createdId}`);

    expect(response.status).toBe(204);
  });
});
