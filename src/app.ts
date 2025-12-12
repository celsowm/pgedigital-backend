import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { RegisterRoutes } from './routes/routes.js';
import { openSession } from './db/session-mssql.js';
import { errorHandler } from './middlewares/error-handler.js';
import openapiDocument from '../docs/openapi.json' with { type: 'json' };

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('tiny'));

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapiDocument, { explorer: true }));
app.get('/api', (_req, res) => res.redirect('/api/docs'));

app.use(async (req, res, next) => {
  try {
    const { session, cleanup } = await openSession();
    req.ormSession = session;

    let cleanedUp = false;
    const safeCleanup = () => {
      if (cleanedUp) return;
      cleanedUp = true;

      // fire-and-forget cleanup; errors should not crash the process
      void cleanup().catch((err) => {
        console.error('Error cleaning up ORM session:', err);
      });
    };

    // `finish` for normal completion, `close` for aborted connections.
    res.once('finish', safeCleanup);
    res.once('close', safeCleanup);

    next();
  } catch (error) {
    next(error);
  }
});

RegisterRoutes(app);

app.use(errorHandler);

export { app };
