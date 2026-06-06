import { createApp } from "./app";
import { loadEnv } from "./env";
import { connectDb, disconnectDb } from "./lib/db";

async function main(): Promise<void> {
  const env = loadEnv();
  await connectDb(env.MONGODB_URI);

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    console.log(`[api] listening on http://localhost:${env.PORT} (mounted at /api)`);
  });

  const shutdown = (signal: string) => {
    console.log(`[api] ${signal} received, shutting down`);
    server.close(() => {
      void disconnectDb().finally(() => process.exit(0));
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((err) => {
  console.error("[api] failed to start:", err);
  process.exit(1);
});
