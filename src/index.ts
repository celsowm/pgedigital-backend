import { createExpressApp } from 'adorn-api';
import { HealthController } from './controllers/HealthController.js';
import { createOrm, disposeOrm } from './database/connection.js';

const controllers = [HealthController];

const app = createExpressApp({
  controllers,
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
