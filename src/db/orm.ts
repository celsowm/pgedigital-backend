import type { OrmSession } from "metal-orm";
import { openSession } from "./session-mssql.js";

export const withSession = async <T>(fn: (session: OrmSession) => Promise<T>): Promise<T> => {
  const { session, cleanup } = await openSession();
  try {
    return await fn(session);
  } finally {
    await cleanup();
  }
};
