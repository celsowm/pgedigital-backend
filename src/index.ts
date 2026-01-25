import "./polyfills";
import { createApp } from "./app";

async function start() {
  const app = await createApp();
  const PORT = 3001;

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`OpenAPI docs: http://localhost:${PORT}/docs`);
    console.log(`OpenAPI JSON: http://localhost:${PORT}/openapi.json`);
  });
}

start().catch(error => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
