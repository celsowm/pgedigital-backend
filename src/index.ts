import 'dotenv/config';
import { start } from './app';

export { bootstrap, start } from './app';

if (require.main === module) {
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  start(port).catch((error: Error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}

