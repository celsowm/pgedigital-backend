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

describeDb("Usuario database reads", () => {
  let app: Awaited<ReturnType<typeof createApp>>;

  beforeAll(async () => {
    app = await createApp();
  });

  it("filters by cargoContains", async () => {
    const needle = "a";
    const response = await request(app).get(`/usuario?page=1&pageSize=10&cargoContains=${needle}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({
      items: expect.any(Array),
      page: 1,
      pageSize: 10,
      totalItems: expect.any(Number),
      totalPages: expect.any(Number)
    }));

    const items = response.body.items as Array<{ cargo?: string }>;
    for (const item of items) {
      if (typeof item.cargo === "string") {
        expect(item.cargo.toLowerCase()).toContain(needle);
      }
    }
  });

  it("filters by especializadaId", async () => {
    const optionsResponse = await request(app).get("/especializada/options");
    expect(optionsResponse.status).toBe(200);

    const options = optionsResponse.body as Array<{ id: number }>;
    if (!options.length) {
      return;
    }

    const especializadaId = options[0].id;
    const response = await request(app).get(`/usuario?page=1&pageSize=10&especializadaId=${especializadaId}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({
      items: expect.any(Array),
      page: 1,
      pageSize: 10,
      totalItems: expect.any(Number),
      totalPages: expect.any(Number)
    }));

    const items = response.body.items as Array<{ especializada_id?: number }>;
    for (const item of items) {
      expect(item.especializada_id).toBe(especializadaId);
    }
  });

  it("returns 204 when user has no thumbnail", async () => {
    const response = await request(app).get(`/usuario/999999/thumbnail/image`);

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
  });

  it("returns thumbnail image with correct headers when user has thumbnail", async () => {
    const usersResponse = await request(app).get(`/usuario?page=1&pageSize=1`);
    expect(usersResponse.status).toBe(200);

    const items = usersResponse.body.items as Array<{ id: number }>;
    if (!items.length) {
      return;
    }

    const userId = items[0].id;
    const response = await request(app).get(`/usuario/${userId}/thumbnail/image`);

    if (response.status === 204) {
      return;
    }

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toMatch(/^image\/(jpeg|png|gif|webp|bmp)/i);
    expect(response.headers["cache-control"]).toBe("public, max-age=86400, immutable");
    expect(response.headers["last-modified"]).toBeDefined();
    expect(Buffer.isBuffer(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });
});
