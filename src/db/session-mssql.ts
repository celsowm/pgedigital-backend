import { Connection, Request, TYPES } from "tedious";
import { SqlServerDialect, createTediousExecutor } from "metal-orm";
import { createSessionFactory } from "./session-factory.js";
import { getMssqlConfig } from "../config/db.js";

export const openSession = createSessionFactory(new SqlServerDialect(), async () => {
  const connection = new Connection(getMssqlConfig());

  await new Promise<void>((resolve, reject) => {
    connection.once("connect", (error: Error | null) => (error ? reject(error) : resolve()));
    connection.once("error", reject);
    connection.connect();
  });

  const executor = createTediousExecutor(connection, { Request, TYPES });

  return {
    executor,
    cleanup: () =>
      new Promise<void>((resolve, reject) => {
        connection.once("end", resolve);
        connection.once("error", reject);
        connection.close();
      }),
  };
});
