import { createExpressApp } from 'adorn-api';
import { initializeDatabase } from './config/database';
import { NotaVersaoController } from './modules/nota-versao';

export async function bootstrap() {
  await initializeDatabase();

  const app = createExpressApp({
    controllers: [NotaVersaoController],
    openApi: {
      info: {
        title: 'PGE Digital API',
        version: '1.0.0',
        description: 'Sistema de Gestão de Processos Eletrônicos',
      },
      docs: true,
    },
  });

  return app;
}

export async function start(port = 3000) {
  const app = await bootstrap();

  return new Promise<void>((resolve, reject) => {
    const server = app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
      console.log(`API docs available at http://localhost:${port}/docs`);
      resolve();
    });

    server.on('error', reject);
  });
}
