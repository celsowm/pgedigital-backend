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

describeDb("TipoAudiencia database reads", () => {
  let app: Awaited<ReturnType<typeof createApp>>;

  beforeAll(async () => {
    app = await createApp();
  });

  it("filters by tipoProcessoAdministrativoId", async () => {
    const optionsResponse = await request(app).get("/tipo-processo-administrativo/options");
    expect(optionsResponse.status).toBe(200);

    const options = optionsResponse.body as Array<{ id: number }>;
    if (!options.length) {
      return;
    }

    const tipoProcessoAdministrativoId = options[0].id;
    const response = await request(app).get(
      `/tipo-audiencia?page=1&pageSize=10&tipoProcessoAdministrativoId=${tipoProcessoAdministrativoId}`
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({
      items: expect.any(Array),
      page: 1,
      pageSize: 10,
      totalItems: expect.any(Number),
      totalPages: expect.any(Number)
    }));

    const items = response.body.items as Array<{ tipo_processo_administrativo_id?: number }>;
    for (const item of items) {
      expect(item.tipo_processo_administrativo_id).toBe(tipoProcessoAdministrativoId);
    }
  });
});
