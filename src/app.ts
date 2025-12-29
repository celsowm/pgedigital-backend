import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import { createAdornExpressApp } from 'adorn-api/express';
import { openSession } from './db/session-mssql.js';
import { errorHandler } from './middlewares/error-handler.js';
import { logger } from './services/logger.js';
import { API_BASE_PATH, API_DOCS_PATH } from './config/api.js';
import type { Request as ExpressRequest } from 'express';
import type { OrmSession } from 'metal-orm';

// Import migrated controller
import { EspecializadaController } from './controllers/EspecializadaController.js';
import { ItemAjudaController } from './controllers/ItemAjudaController.js';
import { NotaVersaoController } from './controllers/NotaVersaoController.js';
import { TestController } from './controllers/TestController.js';

// Controller factory to inject ORM session dependency
function createOrmControllerFactory() {
  return (ctor: any, req: ExpressRequest) => {
    const controller = new ctor();
    
    // Add session requirement method to all controllers
    if (!controller.requireSession) {
      controller.requireSession = (request: ExpressRequest): OrmSession => {
        if (!request.ormSession) {
          throw new Error('Orm session is missing from the request');
        }
        return request.ormSession;
      };
    }
    
    return controller;
  };
}

// Session middleware - creates ORM session per request
async function sessionMiddleware(req: ExpressRequest, res: express.Response, next: express.NextFunction) {
  try {
    const { session, cleanup } = await openSession();
    req.ormSession = session;

    let cleanedUp = false;
    const safeCleanup = () => {
      if (cleanedUp) return;
      cleanedUp = true;

      // fire-and-forget cleanup; errors should not crash the process
      void cleanup().catch((err) => {
        logger.error('Error cleaning up ORM session', err);
      });
    };

    // `finish` for normal completion, `close` for aborted connections.
    res.once('finish', safeCleanup);
    res.once('close', safeCleanup);

    next();
  } catch (error) {
    next(error);
  }
}

// Create Express app with Adorn-API
const app = createAdornExpressApp({
  controllers: [
    TestController,
    EspecializadaController,
    ItemAjudaController,
    NotaVersaoController,
  ],
  controllerFactory: createOrmControllerFactory(),
});

// Add middleware BEFORE Adorn routes
app.use(cors());
app.use(express.json());
app.use(morgan('tiny'));
app.use(sessionMiddleware);

// Add documentation redirect
app.get(API_BASE_PATH, (_req, res) => res.redirect(API_DOCS_PATH));

// Add error handling (must be last)
app.use(errorHandler);

export { app };
