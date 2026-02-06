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

describeDb("PalavraChave database reads", () => {
    let app: Awaited<ReturnType<typeof createApp>>;

    beforeAll(async () => {
        app = await createApp();
    });

    it("supports pagination and filter query", async () => {
        const response = await request(app).get("/palavra-chave?page=1&pageSize=5&palavraContains=a");

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

describeWrite("PalavraChave database CRUD", () => {
    let app: Awaited<ReturnType<typeof createApp>>;
    let createdId: number;
    const basePalavra = `Vitest Palavra ${Date.now()}`;

    beforeAll(async () => {
        app = await createApp();
    });

    it("creates a palavra-chave", async () => {
        const response = await request(app).post("/palavra-chave").send({
            palavra: basePalavra,
            obrigatoriedade: false
        });

        expect(response.status).toBe(201);
        expect(response.body).toEqual(expect.objectContaining({
            id: expect.any(Number),
            palavra: basePalavra,
            obrigatoriedade: false
        }));

        createdId = response.body.id;
    });

    it("reads the created palavra-chave", async () => {
        const response = await request(app).get(`/palavra-chave/${createdId}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(expect.objectContaining({
            id: createdId,
            palavra: basePalavra
        }));
    });

    it("updates the palavra-chave", async () => {
        const updatedPalavra = `${basePalavra} Updated`;
        const response = await request(app).patch(`/palavra-chave/${createdId}`).send({ palavra: updatedPalavra });

        expect(response.status).toBe(200);
        expect(response.body).toEqual(expect.objectContaining({
            id: createdId,
            palavra: updatedPalavra
        }));
    });

    it("deletes the palavra-chave", async () => {
        const response = await request(app).delete(`/palavra-chave/${createdId}`);

        expect(response.status).toBe(204);
    });
});
