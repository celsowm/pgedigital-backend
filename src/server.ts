import "dotenv/config";
import { bootstrap } from "adorn-api/express";
import { getApiConfig } from "./config/api.js";
import { HealthController } from "./controllers/HealthController.js";
import { EspecializadaController } from "./controllers/especializada/EspecializadaController.js";
import { NotaVersaoController } from "./controllers/nota-versao/NotaVersaoController.js";

const shutdownSignals = ["SIGINT", "SIGTERM"] as const;

const main = async () => {
  const apiConfig = getApiConfig();

  const result = await bootstrap({
    controllers: [HealthController, NotaVersaoController, EspecializadaController],
    ...apiConfig,
    coerce: {
      body: true,
      query: true,
      path: true,
      dateTime: true,
      date: true,
    },
  });

  for (const signal of shutdownSignals) {
    process.on(signal, async () => {
      await result.close();
      process.exit(0);
    });
  }
};

main().catch(error => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
