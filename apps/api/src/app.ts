import express, { type Express, Router } from "express";
import cookieParser from "cookie-parser";

import { verifyCsrf } from "./middleware/csrf";
import { errorHandler, notFound } from "./middleware/error-handler";
import { authRouter } from "./features/auth";

/**
 * Build the Express application. All routes are mounted under `/api` because
 * the single-origin proxy forwards `/api/*` here without stripping the prefix.
 * No CORS is configured — the browser only ever talks to one origin.
 */
export function createApp(): Express {
  const app = express();

  app.disable("x-powered-by");
  app.use(express.json());
  app.use(cookieParser());
  // Double-submit CSRF guard for every state-changing request.
  app.use(verifyCsrf);

  const api = Router();
  api.get("/health", (_req, res) => {
    res
      .status(200)
      .json({ status: "ok", uptime: process.uptime(), timestamp: new Date().toISOString() });
  });
  api.use("/auth", authRouter);

  app.use("/api", api);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
