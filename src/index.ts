import { createExpressApp } from 'adorn-api';
import { bootstrapEntities } from 'metal-orm';
import { HealthController } from './controllers/HealthController.js';
import { NotaVersaoController } from './controllers/nota-versao/nota-versao.controller.js';
import { createOrm, disposeOrm } from './database/connection.js';

const controllers = [HealthController, NotaVersaoController];

const app = createExpressApp({
  controllers,
  cors: true,
  openApi: {
    path: '/openapi.json',
    info: {
      title: 'PGE Digital Backend API',
      version: '1.0.0',
      description: 'API for PGE Digital Backend'
    },
    docs: {
      path: '/docs'
    }
  }
});

async function bootstrap() {
  bootstrapEntities();
  await createOrm();
  console.log('Database connection established');

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Swagger docs at http://localhost:${PORT}/docs`);
  });
}

process.on('SIGTERM', async () => {
  await disposeOrm();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await disposeOrm();
  process.exit(0);
});

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
