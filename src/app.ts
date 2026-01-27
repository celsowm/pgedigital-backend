import { createExpressApp } from "adorn-api";
import { EspecializadaController } from "./controllers/especializada/especializada.controller";
import { NotaVersaoController } from "./controllers/nota-versao/nota-versao.controller";
import { TestController } from "./controllers/test/test.controller";
import { UsuarioController } from "./controllers/usuario/usuario.controller";

export function createApp() {
  return createExpressApp({
    controllers: [EspecializadaController, NotaVersaoController, TestController, UsuarioController],
    cors: true,
    openApi: {
      info: {
        title: "PGE Digital API",
        version: "1.0.0"
      },
      docs: true
    }
  });
}
