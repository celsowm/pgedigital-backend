import { createExpressApp } from 'adorn-api';
import { HealthController } from './controllers/HealthController.js';

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger docs at http://localhost:${PORT}/docs`);
});
