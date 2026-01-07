import "dotenv/config";
import { bootstrap } from "adorn-api/express";
import { getApiConfig } from "./config/api.js";
import { HealthController } from "./controllers/HealthController.js";
import { EspecializadaController } from "./controllers/EspecializadaController.js";
import { NotaVersaoController } from "./controllers/NotaVersaoController.js";
import { EquipeController } from "./controllers/EquipeController.js";
import { UsuarioController } from "./controllers/UsuarioController.js";

const shutdownSignals = ["SIGINT", "SIGTERM"] as const;

const main = async () => {
  const apiConfig = getApiConfig();

  const result = await bootstrap({
    controllers: [HealthController, NotaVersaoController, EspecializadaController, EquipeController, UsuarioController],
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
