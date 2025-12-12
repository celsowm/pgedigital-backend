import 'dotenv/config';
import { app } from './app.js';
import { initEntityTables } from './entities/index.js';

initEntityTables();

const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/api`);
});
