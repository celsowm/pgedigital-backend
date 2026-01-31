import "./polyfills";
import { createExpressApp } from "adorn-api";
import type { Express } from "express";
import { AcervoController } from "./controllers/acervo.controller";
import { EspecializadaController } from "./controllers/especializada.controller";
import { NotaVersaoController } from "./controllers/nota-versao.controller";
import { TestController } from "./controllers/test.controller";
import { UsuarioController } from "./controllers/usuario.controller";
import { EquipeController } from "./controllers/equipe.controller";
import { TipoAcervoController } from "./controllers/tipo-acervo.controller";
import { TipoAfastamentoController } from "./controllers/tipo-afastamento.controller";
import { MniTribunalController } from "./controllers/mni-tribunal.controller";
import { ClasseProcessualController } from "./controllers/classe-processual.controller";
import { TipoProcessoAdministrativoController } from "./controllers/tipo-processo-administrativo.controller";
import { errorHandler, queryContextMiddleware } from "./middleware/error-handler";
import { MateriaController } from "./controllers/materia.controller";
import { NaturezaIncidenteController } from "./controllers/natureza-incidente.controller";
import { TipoDivisaoCargaTrabalhoController } from "./controllers/tipo-divisao-carga-trabalho.controller";

export async function createApp(): Promise<Express> {
  const app = await createExpressApp({
    controllers: [AcervoController, EspecializadaController, NotaVersaoController, TestController, UsuarioController, EquipeController, TipoAcervoController, TipoAfastamentoController, MniTribunalController, ClasseProcessualController, TipoProcessoAdministrativoController, MateriaController, NaturezaIncidenteController, TipoDivisaoCargaTrabalhoController],
    cors: true,
    openApi: {
      info: {
        title: "PGE Digital API",
        version: "1.0.0"
      },
      docs: true
    }
  });

  // Apply query context middleware to track SQL queries per request
  // This must wrap all routes that use database operations
  app.use((req, res, next) => {
    queryContextMiddleware(async () => {
      // Continue to the next middleware within the query context
      next();
    }).catch(next);
  });

  // Global error handler - must be registered after all routes
  app.use(errorHandler);

  return app;
}
