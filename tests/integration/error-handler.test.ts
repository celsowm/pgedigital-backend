import express from "express";
import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";
import { errorHandler, queryContextMiddleware } from "../../src/middleware/error-handler";
import { setLastQuery } from "../../src/db/query-context";

describe("errorHandler middleware", () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it("formats database errors with sql and stack in development", async () => {
    process.env.NODE_ENV = "development";

    const app = express();
    app.use((req, _res, next) => {
      queryContextMiddleware(async () => {
        next();
      }).catch(next);
    });

    app.get("/boom", (_req, _res, next) => {
      setLastQuery("SELECT * FROM materia");
      next(new Error("SQL syntax error near FROM"));
    });

    app.use(errorHandler);

    const response = await request(app).get("/boom");

    expect(response.status).toBe(500);
    expect(response.body).toEqual(expect.objectContaining({
      message: expect.stringContaining("SQL syntax"),
      mode: "development",
      sql: "SELECT * FROM materia",
      stack: expect.any(String)
    }));
  });
});