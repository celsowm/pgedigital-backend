import 'dotenv/config';
import { app } from './app.js';
import { initEntityTables } from './entities/index.js';
import { drainPool } from './db/connection-pool.js';
import { getServerPort, getServerUrl } from './config/api.js';

initEntityTables();

const port = getServerPort();

const server = app.listen(port, () => {
  console.log(`Server running at ${getServerUrl(port)}`);
});

// Graceful shutdown
const shutdown = async () => {
  console.log('Shutting down gracefully...');
  server.close(async () => {
    await drainPool();
    console.log('Connection pool drained. Goodbye!');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
