import { afterAll, beforeAll, describe, expect, it } from "vitest";
import express, { type Express } from "express";
import cookieParser from "cookie-parser";
import request from "supertest";

import { SESSION_COOKIE } from "../lib/cookies";
import { signSessionToken } from "../lib/jwt";
import { errorHandler } from "./error-handler";
import { requireAuth } from "./require-auth";
import { requireRole } from "./require-role";
import { createUser } from "../features/user";
import { clearTestDb, startTestDb, stopTestDb } from "../test/db";

let app: Express;

beforeAll(async () => {
  await startTestDb();
  await clearTestDb();

  app = express();
  app.use(cookieParser());
  app.get("/admin-only", requireAuth, requireRole("admin", "superadmin"), (_req, res) => {
    res.status(200).json({ ok: true });
  });
  app.use(errorHandler);
});

afterAll(async () => {
  await stopTestDb();
});

function sessionCookie(
  userId: string,
  role: Parameters<typeof signSessionToken>[0]["role"],
): string {
  return `${SESSION_COOKIE}=${signSessionToken({ sub: userId, role })}`;
}

describe("requireRole", () => {
  it("allows a user whose role is permitted", async () => {
    const admin = await createUser({
      email: "admin@example.com",
      passwordHash: "x",
      displayName: "Admin",
      role: "admin",
    });
    await request(app)
      .get("/admin-only")
      .set("Cookie", sessionCookie(admin.id, "admin"))
      .expect(200);
  });

  it("denies a user whose role is not permitted (403)", async () => {
    const player = await createUser({
      email: "player@example.com",
      passwordHash: "x",
      displayName: "Player",
      role: "pc",
    });
    const res = await request(app)
      .get("/admin-only")
      .set("Cookie", sessionCookie(player.id, "pc"))
      .expect(403);
    expect(res.body.error.code).toBe("forbidden");
  });

  it("rejects an unauthenticated request (401)", async () => {
    await request(app).get("/admin-only").expect(401);
  });
});
