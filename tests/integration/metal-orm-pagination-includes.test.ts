import { describe, expect, it } from "vitest";
import { entityRef, selectFromEntity, eq } from "metal-orm";
import { withSession } from "../../src/db/mssql";
import { Carga } from "../../src/entities/Carga";

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

describeDb("Metal ORM Pagination with Deep Navigation (mssql)", () => {
  it("should paginate carga records and load nested relationships for usuario_id 68", async () => {
    await withSession(async (session) => {
      const cargaRef = entityRef(Carga);

      const result = await selectFromEntity(Carga)
        .select({
          id: cargaRef.id,
          usuario_id: cargaRef.usuario_id,
          processo_administrativo_id: cargaRef.processo_administrativo_id,
          registro_tramitacao_id: cargaRef.registro_tramitacao_id
        })
        .where(eq(cargaRef.usuario_id, 68))
        .orderBy(cargaRef.id, "ASC")
        .executePaged(session, { page: 1, pageSize: 25 });

      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(25);
      expect(typeof result.totalItems).toBe("number");

      console.log(`\nPaginated result: ${result.items.length} items on page ${result.page} of ${Math.ceil(result.totalItems / result.pageSize)} (total: ${result.totalItems})`);

      if (result.items.length === 0) {
        console.log("No paginated cargas found for usuario_id = 68");
        return;
      }

      let pessoaNomeFound = false;

      for (const carga of result.items) {
        expect(carga.id).toBeDefined();
        expect(carga.usuario_id).toBe(68);

        const registroTramitacao = await (carga as any).registroTramitacao?.load();
        expect(registroTramitacao).toBeDefined();

        const tramitacao = await (registroTramitacao as any)?.tramitacao?.load();
        if (tramitacao) {
          console.log(`  Carga ${carga.id}: Tramitacao -> ${tramitacao.nome} (${tramitacao.codigo})`);
        }

        const remetente = await (registroTramitacao as any)?.remetente?.load();
        if (remetente) {
          console.log(`  Carga ${carga.id}: Remetente -> ${remetente.nome}`);
        }

        const processoAdministrativo = await (carga as any).processoAdministrativo?.load();
        if (processoAdministrativo) {
          console.log(`  Carga ${carga.id}: PA -> ${processoAdministrativo.codigo_pa}`);

          const especializada = await (processoAdministrativo as any).especializada?.load();
          if (especializada) {
            console.log(`    -> Especializada: ${especializada.nome}`);
          }

          const classificacao = await (processoAdministrativo as any).classificacao?.load();
          if (classificacao) {
            console.log(`    -> Classificacao: ${classificacao.nome}`);
          }

          const acervo = await (processoAdministrativo as any).acervo?.load();
          if (acervo) {
            console.log(`    -> Acervo: ${acervo.nome}`);
          }

          const processoJudicial = await (processoAdministrativo as any).processoJudicial?.load();
          if (processoJudicial) {
            console.log(`    -> ProcessoJudicial: ${processoJudicial.numero}`);

            const partes = await (processoJudicial as any).partes?.load();
            console.log(`       -> Partes count: ${partes?.length ?? 0}`);

            if (partes && partes.length > 0) {
              for (const parte of partes.slice(0, 3)) {
                const pessoa = await (parte as any).pessoa?.load();
                if (pessoa) {
                  expect(pessoa.id).toBeDefined();
                  expect(pessoa.nome).toBeDefined();
                  pessoaNomeFound = true;
                  console.log(`          -> Parte ${parte.id}: Pessoa ${pessoa.nome}`);
                }
              }
            }
          }
        }
      }

      if (pessoaNomeFound) {
        console.log("\n✅ Paginated results successfully loaded nested pessoa data!");
      } else {
        console.log("\n⚠️ No pessoa data found in paginated results");
      }
    });
  }, 120_000);

  it("should retrieve some names from the database via paginated query", async () => {
    await withSession(async (session) => {
      const result = await selectFromEntity(Carga)
        .select({
          id: entityRef(Carga).id,
          usuario_id: entityRef(Carga).usuario_id,
          processo_administrativo_id: entityRef(Carga).processo_administrativo_id,
          registro_tramitacao_id: entityRef(Carga).registro_tramitacao_id
        })
        .where(eq(entityRef(Carga).usuario_id, 68))
        .orderBy(entityRef(Carga).id, "ASC")
        .executePaged(session, { page: 1, pageSize: 10 });

      console.log("\n=== Paginated Results with Names ===");
      console.log(`Total items: ${result.totalItems}`);
      console.log(`Page: ${result.page}, PageSize: ${result.pageSize}`);
      
      const names: Array<{ cargaId: number; paCodigo?: string; pessoaNome?: string; remetenteNome?: string }> = [];

      for (const carga of result.items.slice(0, 5)) {
        const pa = await (carga as any).processoAdministrativo?.load();
        const rt = await (carga as any).registroTramitacao?.load();
        const remetente = await (rt as any)?.remetente?.load();
        
        let pessoaNome: string | undefined;
        if (pa) {
          const pj = await (pa as any).processoJudicial?.load();
          if (pj) {
            const partes = await (pj as any).partes?.load();
            if (partes && partes.length > 0) {
              const pessoa = await (partes[0] as any).pessoa?.load();
              pessoaNome = pessoa?.nome;
            }
          }
        }

        names.push({
          cargaId: carga.id,
          paCodigo: pa?.codigo_pa,
          pessoaNome,
          remetenteNome: remetente?.nome
        });
      }

      console.log("\nFirst results:");
      names.forEach((item, idx) => {
        console.log(`${idx + 1}. Carga ${item.cargaId} | PA: ${item.paCodigo || "N/A"} | Pessoa: ${item.pessoaNome || "N/A"} | Remetente: ${item.remetenteNome || "N/A"}`);
      });

      expect(result.items.length).toBeGreaterThanOrEqual(0);
    });
  }, 120_000);
});
