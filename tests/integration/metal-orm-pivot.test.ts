import { describe, expect, it } from "vitest";
import { entityRef, eq, selectFromEntity } from "metal-orm";
import { withSession } from "../../src/db/mssql";
import { AfastamentoPessoa } from "../../src/entities/AfastamentoPessoa";
import { AfastamentoPessoaUsuario } from "../../src/entities/AfastamentoPessoaUsuario";

/**
 * Pivot hydration regression test.
 *
 * Expected (future behavior):
 *   Pivot columns should be promoted to the related entity surface
 *   (e.g. substituto.usa_equipe_acervo_substituto), not only inside _pivot.
 *
 * Current behavior:
 *   Pivot columns are available only as substituto._pivot.*
 *
 * This test is marked as `it.fails` so it documents the bug without breaking CI.
 * When Metal ORM is fixed, switch to `it(...)` and remove the "fails" modifier.
 */
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

describeDb("Metal ORM pivot hydration", () => {
  it.fails("should expose pivot columns on related entities (currently only _pivot exists)", async () => {
    await withSession(async (session) => {
      const pivotRef = entityRef(AfastamentoPessoaUsuario);
      const [pivotRow] = await selectFromEntity(AfastamentoPessoaUsuario)
        .select({
          afastamento_pessoa_id: pivotRef.afastamento_pessoa_id,
          usuario_id: pivotRef.usuario_id,
          usa: pivotRef.usa_equipe_acervo_substituto,
          final: pivotRef.final_codigo_pa
        })
        .executePlain(session);

      if (!pivotRow) {
        throw new Error("No pivot rows found for afastamento_pessoa_usuario.");
      }

      const afastamentoRef = entityRef(AfastamentoPessoa);
      const [afastamento] = await selectFromEntity(AfastamentoPessoa)
        .include("substitutos", {
          columns: ["id", "nome"],
          pivot: { columns: ["usa_equipe_acervo_substituto", "final_codigo_pa"] }
        })
        .where(eq(afastamentoRef.id, pivotRow.afastamento_pessoa_id))
        .execute(session);

      expect(afastamento).toBeTruthy();

      const substitutos = await afastamento.substitutos.load();
    const substituto = substitutos.find((s: any) => s.id === pivotRow.usuario_id) ?? substitutos[0];
    expect(substituto).toBeTruthy();

    const hasPivot = Object.prototype.hasOwnProperty.call(substituto as object, "_pivot");
    expect(hasPivot).toBe(true);

    // Fails today: pivot fields are not promoted to the related entity.
    const hasUsa = Object.prototype.hasOwnProperty.call(substituto as object, "usa_equipe_acervo_substituto");
    const hasFinal = Object.prototype.hasOwnProperty.call(substituto as object, "final_codigo_pa");
    expect(hasUsa).toBe(true);
    expect(hasFinal).toBe(true);
    });
  });
});
