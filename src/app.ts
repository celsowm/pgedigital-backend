import { createExpressApp } from "adorn-api";
import type { Express } from "express";
import { AcervoController } from "./controllers/acervo/acervo.controller";
import { EspecializadaController } from "./controllers/especializada/especializada.controller";
import { NotaVersaoController } from "./controllers/nota-versao/nota-versao.controller";
import { TestController } from "./controllers/test/test.controller";
import { UsuarioController } from "./controllers/usuario/usuario.controller";
import { EquipeController } from "./controllers/equipe/equipe.controller";
import { TipoAcervoController } from "./controllers/tipo-acervo/tipo-acervo.controller";
import { TipoAfastamentoController } from "./controllers/tipo-afastamento/tipo-afastamento.controller";
import { errorHandler, queryContextMiddleware } from "./middleware/error-handler";

export async function createApp(): Promise<Express> {
  const app = await createExpressApp({
    controllers: [AcervoController, EspecializadaController, NotaVersaoController, TestController, UsuarioController, EquipeController, TipoAcervoController, TipoAfastamentoController],
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
