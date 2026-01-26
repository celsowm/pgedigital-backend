import { createExpressApp } from "adorn-api";
import { TestController } from "./controllers/test/test.controller";

export function createApp() {
  return createExpressApp({
    controllers: [TestController],
    openApi: {
      info: {
        title: "PGE Digital API",
        version: "1.0.0"
      },
      docs: true
    }
  });
}
