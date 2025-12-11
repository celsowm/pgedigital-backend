import dotenv from 'dotenv';
import { app } from './app.js';
import { allEntityTables } from './entities/index.js';

dotenv.config();

allEntityTables();

const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/api`);
});
