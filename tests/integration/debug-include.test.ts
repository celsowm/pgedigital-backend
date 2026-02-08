import { describe, expect, it } from "vitest";
import { entityRef, selectFromEntity, eq, toPagedResponse } from "metal-orm";
import { withSession } from "../../src/db/mssql";
import { Carga } from "../../src/entities/Carga";
import { CaixaEntradaRepository } from "../../src/repositories/caixa-entrada.repository";

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

describeDb("Debug: CaixaEntrada .include() vs manual .load()", () => {
  it("should compare repository .include() vs manual loading", async () => {
    await withSession(async (session) => {
      console.log("\n=== TEST 1: Using Repository with .include() ===");
      const repo = new CaixaEntradaRepository();
      const queryWithIncludes = repo.buildListQuery()
        .where(eq(entityRef(Carga).usuario_id, 68))
        .orderBy(entityRef(Carga).id, "DESC");

      const pagedWithIncludes = await queryWithIncludes.executePaged(session, { page: 1, pageSize: 5 });
      console.log(`Total: ${pagedWithIncludes.totalItems}, Items: ${pagedWithIncludes.items.length}`);

      // Check first item with includes
      const firstWithInclude = pagedWithIncludes.items[0];
      console.log("\nFirst item from .include():");
      console.log("  Carga ID:", firstWithInclude.id);
      console.log("  registroTramitacao type:", typeof firstWithInclude.registroTramitacao);
      console.log("  registroTramitacao keys:", Object.keys(firstWithInclude.registroTramitacao || {}));
      
      // Check if tramitacao is already loaded
      const rt = firstWithInclude.registroTramitacao as any;
      if (rt) {
        console.log("  Has tramitacao property:", 'tramitacao' in rt);
        console.log("  Has remetente property:", 'remetente' in rt);
        console.log("  tramitacao value:", rt.tramitacao);
        console.log("  remetente value:", rt.remetente);
        
        // Try loading it manually
        console.log("\n  Trying manual .load() on tramitacao...");
        const tramitacaoLoaded = await rt.tramitacao?.load?.();
        console.log("  tramitacao loaded:", tramitacaoLoaded);
      }

      console.log("\n=== TEST 2: Manual .load() without .include() ===");
      const queryWithoutIncludes = selectFromEntity(Carga)
        .select({
          id: entityRef(Carga).id,
          usuario_id: entityRef(Carga).usuario_id,
          processo_administrativo_id: entityRef(Carga).processo_administrativo_id,
          registro_tramitacao_id: entityRef(Carga).registro_tramitacao_id
        })
        .where(eq(entityRef(Carga).usuario_id, 68))
        .orderBy(entityRef(Carga).id, "DESC");

      const pagedWithoutIncludes = await queryWithoutIncludes.executePaged(session, { page: 1, pageSize: 5 });
      
      const firstWithoutInclude = pagedWithoutIncludes.items[0];
      console.log("\nFirst item without .include():");
      console.log("  Carga ID:", firstWithoutInclude.id);
      console.log("  registroTramitacao type:", typeof (firstWithoutInclude as any).registroTramitacao);
      
      // Load manually
      const rt2 = await (firstWithoutInclude as any).registroTramitacao?.load();
      console.log("\n  After manual .load():");
      console.log("  RT ID:", rt2?.id);
      
      const tramitacao2 = await (rt2 as any)?.tramitacao?.load();
      console.log("  Tramitacao:", tramitacao2?.nome, "(", tramitacao2?.codigo, ")");
      
      const remetente2 = await (rt2 as any)?.remetente?.load();
      console.log("  Remetente:", remetente2?.nome);

      console.log("\n=== TEST 3: JSON Serialization Test ===");
      // Simulate what happens in the API
      const response = toPagedResponse(pagedWithIncludes);
      const firstItem = (response as any).items[0];
      console.log("\nSerialized response first item:");
      console.log("  registroTramitacao:", JSON.stringify(firstItem.registroTramitacao, null, 2));
      console.log("  processoAdministrativo:", JSON.stringify(firstItem.processoAdministrativo, null, 2));

      expect(pagedWithIncludes.totalItems).toBe(pagedWithoutIncludes.totalItems);
    });
  }, 120_000);
});
