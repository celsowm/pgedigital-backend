import { describe, expect, it } from "vitest";
import { entityRef, selectFromEntity, eq, toPagedResponse, applyFilter } from "metal-orm";
import { withSession } from "../../src/db/mssql";
import { Carga } from "../../src/entities/Carga";
import { CaixaEntradaRepository, CAIXA_ENTRADA_FILTER_MAPPINGS } from "../../src/repositories/caixa-entrada.repository";

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

describeDb("Debug: API serialization issue", () => {
  it("should mimic API call exactly", async () => {
    await withSession(async (session) => {
      const repo = new CaixaEntradaRepository();
      
      // Mimic exactly what the service does
      const filters = { usuarioId: { operator: "equals" as const, value: 68 } };
      
      let queryBuilder = applyFilter(
        repo.buildListQuery(),
        repo.entityClass,
        filters
      );
      
      queryBuilder = queryBuilder.orderBy(entityRef(Carga).id, "DESC");
      
      const paged = await queryBuilder.executePaged(session, { page: 1, pageSize: 5 });
      const response = toPagedResponse(paged);
      
      console.log("\n=== Response from toPagedResponse ===");
      console.log("Total items:", response.totalItems);
      console.log("Page:", response.page);
      console.log("Items count:", response.items.length);
      
      const firstItem = (response as any).items[0];
      console.log("\n=== First Item Structure ===");
      console.log("Carga ID:", firstItem.id);
      console.log("Carga keys:", Object.keys(firstItem));
      
      console.log("\n=== registroTramitacao ===");
      console.log("Type:", typeof firstItem.registroTramitacao);
      console.log("Keys:", Object.keys(firstItem.registroTramitacao || {}));
      console.log("Value:", JSON.stringify(firstItem.registroTramitacao, null, 2));
      
      console.log("\n=== processoAdministrativo ===");
      console.log("Type:", typeof firstItem.processoAdministrativo);
      console.log("Keys:", Object.keys(firstItem.processoAdministrativo || {}));
      console.log("Has especializada:", 'especializada' in (firstItem.processoAdministrativo || {}));
      console.log("Has classificacao:", 'classificacao' in (firstItem.processoAdministrativo || {}));
      console.log("Has acervo:", 'acervo' in (firstItem.processoAdministrativo || {}));
      console.log("Has processoJudicial:", 'processoJudicial' in (firstItem.processoAdministrativo || {}));
      
      if (firstItem.processoAdministrativo?.processoJudicial) {
        console.log("\n=== processoJudicial ===");
        console.log("Keys:", Object.keys(firstItem.processoAdministrativo.processoJudicial));
        console.log("Has partes:", 'partes' in firstItem.processoAdministrativo.processoJudicial);
        
        if (firstItem.processoAdministrativo.processoJudicial.partes) {
          console.log("Partes count:", firstItem.processoAdministrativo.processoJudicial.partes.length);
          if (firstItem.processoAdministrativo.processoJudicial.partes.length > 0) {
            const firstParte = firstItem.processoAdministrativo.processoJudicial.partes[0];
            console.log("\n=== First Parte ===");
            console.log("Keys:", Object.keys(firstParte));
            console.log("Has pessoa:", 'pessoa' in firstParte);
            if (firstParte.pessoa) {
              console.log("Pessoa nome:", firstParte.pessoa.nome);
            }
          }
        }
      }
      
      // Check what adorn-api would see
      console.log("\n=== Full JSON (what API should return) ===");
      const jsonStr = JSON.stringify(response, null, 2);
      const parsed = JSON.parse(jsonStr);
      
      console.log("Parsed first item registroTramitacao keys:", Object.keys(parsed.items[0].registroTramitacao || {}));
      console.log("Has tramitacao in JSON:", 'tramitacao' in (parsed.items[0].registroTramitacao || {}));
      console.log("Has remetente in JSON:", 'remetente' in (parsed.items[0].registroTramitacao || {}));
      
      expect(response.items.length).toBeGreaterThan(0);
      expect(response.totalItems).toBeGreaterThan(0);
    });
  }, 120_000);
  
  it("should check if nested data exists in toPagedResponse", async () => {
    await withSession(async (session) => {
      const repo = new CaixaEntradaRepository();
      
      const paged = await repo.buildListQuery()
        .where(eq(entityRef(Carga).usuario_id, 68))
        .orderBy(entityRef(Carga).id, "DESC")
        .executePaged(session, { page: 1, pageSize: 1 });
      
      console.log("\n=== Before toPagedResponse ===");
      const firstBefore = paged.items[0] as any;
      console.log("First item type:", typeof firstBefore);
      console.log("First item keys:", Object.keys(firstBefore));
      
      const response = toPagedResponse(paged);
      
      console.log("\n=== After toPagedResponse ===");
      const firstAfter = response.items[0] as any;
      console.log("First item type:", typeof firstAfter);
      console.log("First item keys:", Object.keys(firstAfter));
      
      // Check if data is actually there
      console.log("\n=== Checking Nested Data ===");
      console.log("registroTramitacao exists:", !!firstAfter.registroTramitacao);
      console.log("registroTramitacao.tramitacao exists:", !!firstAfter.registroTramitacao?.tramitacao);
      console.log("registroTramitacao.remetente exists:", !!firstAfter.registroTramitacao?.remetente);
      console.log("processoAdministrativo exists:", !!firstAfter.processoAdministrativo);
      console.log("processoAdministrativo.especializada exists:", !!firstAfter.processoAdministrativo?.especializada);
      console.log("processoAdministrativo.processoJudicial exists:", !!firstAfter.processoAdministrativo?.processoJudicial);
      
      if (firstAfter.processoAdministrativo?.processoJudicial?.partes?.length > 0) {
        console.log("First parte pessoa exists:", !!firstAfter.processoAdministrativo.processoJudicial.partes[0].pessoa);
        if (firstAfter.processoAdministrativo.processoJudicial.partes[0].pessoa) {
          console.log("First pessoa nome:", firstAfter.processoAdministrativo.processoJudicial.partes[0].pessoa.nome);
        }
      }
      
      expect(firstAfter.registroTramitacao).toBeDefined();
      expect(firstAfter.processoAdministrativo).toBeDefined();
    });
  }, 120_000);
});
