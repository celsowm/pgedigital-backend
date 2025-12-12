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
    res.on('finish', cleanup);
    res.on('close', cleanup);
    next();
  } catch (error) {
    next(error);
  }
});

RegisterRoutes(app);

app.use(errorHandler);

export { app };
