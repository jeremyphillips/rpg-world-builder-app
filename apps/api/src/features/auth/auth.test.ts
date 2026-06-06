import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import request, { type Agent } from "supertest";
import type { Express } from "express";

import { createApp } from "../../app";
import { CSRF_HEADER } from "../../lib/cookies";
import { clearTestDb, startTestDb, stopTestDb } from "../../test/db";

let app: Express;

const credentials = {
  email: "dm@example.com",
  password: "supersecret",
  displayName: "Game Master",
};

/** A supertest agent that persists cookies, primed with a CSRF token. */
async function newAgent(): Promise<{ agent: Agent; csrfToken: string }> {
  const agent = request.agent(app);
  const res = await agent.get("/api/auth/csrf");
  return { agent, csrfToken: res.body.csrfToken as string };
}

async function registerAndLogin(): Promise<{ agent: Agent; csrfToken: string }> {
  const { agent } = await newAgent();
  const csrf1 = (await agent.get("/api/auth/csrf")).body.csrfToken as string;
  await agent.post("/api/auth/register").set(CSRF_HEADER, csrf1).send(credentials).expect(201);
  const loginRes = await agent
    .post("/api/auth/login")
    .set(CSRF_HEADER, csrf1)
    .send({ email: credentials.email, password: credentials.password })
    .expect(200);
  return { agent, csrfToken: loginRes.body.csrfToken as string };
}

beforeAll(async () => {
  await startTestDb();
  app = createApp();
});

afterEach(async () => {
  await clearTestDb();
});

afterAll(async () => {
  await stopTestDb();
});

describe("GET /api/health", () => {
  it("returns ok", async () => {
    const res = await request(app).get("/api/health").expect(200);
    expect(res.body.status).toBe("ok");
  });
});

describe("auth flow", () => {
  it("registers, logs in (sets cookie), reads /me, logs out, then 401s", async () => {
    const { agent, csrfToken } = await newAgent();

    const registerRes = await agent
      .post("/api/auth/register")
      .set(CSRF_HEADER, csrfToken)
      .send(credentials)
      .expect(201);
    expect(registerRes.body.user).toMatchObject({
      email: credentials.email,
      displayName: credentials.displayName,
      role: "pc",
    });
    expect(registerRes.body.user.password).toBeUndefined();
    expect(registerRes.body.user.passwordHash).toBeUndefined();

    const loginRes = await agent
      .post("/api/auth/login")
      .set(CSRF_HEADER, csrfToken)
      .send({ email: credentials.email, password: credentials.password })
      .expect(200);
    const setCookies = loginRes.headers["set-cookie"] as unknown as string[];
    expect(setCookies.some((c) => c.startsWith("rpg_session=") && c.includes("HttpOnly"))).toBe(
      true,
    );

    const meRes = await agent.get("/api/auth/me").expect(200);
    expect(meRes.body.user.email).toBe(credentials.email);

    const logoutToken = loginRes.body.csrfToken as string;
    await agent.post("/api/auth/logout").set(CSRF_HEADER, logoutToken).expect(200);

    await agent.get("/api/auth/me").expect(401);
  });

  it("rejects login with a wrong password", async () => {
    const { agent, csrfToken } = await newAgent();
    await agent
      .post("/api/auth/register")
      .set(CSRF_HEADER, csrfToken)
      .send(credentials)
      .expect(201);
    await agent
      .post("/api/auth/login")
      .set(CSRF_HEADER, csrfToken)
      .send({ email: credentials.email, password: "wrongpassword" })
      .expect(401);
  });

  it("rejects /me without a session cookie", async () => {
    await request(app).get("/api/auth/me").expect(401);
  });

  it("rejects duplicate registration with 409", async () => {
    const { agent, csrfToken } = await newAgent();
    await agent
      .post("/api/auth/register")
      .set(CSRF_HEADER, csrfToken)
      .send(credentials)
      .expect(201);
    await agent
      .post("/api/auth/register")
      .set(CSRF_HEADER, csrfToken)
      .send(credentials)
      .expect(409);
  });

  it("rejects invalid register payloads with 400", async () => {
    const { agent, csrfToken } = await newAgent();
    const res = await agent
      .post("/api/auth/register")
      .set(CSRF_HEADER, csrfToken)
      .send({ email: "not-an-email", password: "short", displayName: "" })
      .expect(400);
    expect(res.body.error.code).toBe("bad_request");
    expect(res.body.error.details.issues.length).toBeGreaterThan(0);
  });
});

describe("CSRF double-submit guard", () => {
  it("rejects a mutation with no CSRF header (403)", async () => {
    const { agent } = await newAgent();
    const res = await agent.post("/api/auth/register").send(credentials).expect(403);
    expect(res.body.error.code).toBe("forbidden");
  });

  it("rejects a mutation when header does not match the cookie (403)", async () => {
    const { agent } = await newAgent();
    await agent
      .post("/api/auth/register")
      .set(CSRF_HEADER, "tampered-value")
      .send(credentials)
      .expect(403);
  });

  it("accepts a mutation when header matches the cookie", async () => {
    const { agent, csrfToken } = await newAgent();
    await agent
      .post("/api/auth/register")
      .set(CSRF_HEADER, csrfToken)
      .send(credentials)
      .expect(201);
  });

  it("does not require a token for safe (GET) requests", async () => {
    await request(app).get("/api/health").expect(200);
  });
});

// Touch the helper so it is covered even though the flow tests inline their steps.
describe("session reuse", () => {
  it("keeps the session across requests via the cookie jar", async () => {
    const { agent } = await registerAndLogin();
    await agent.get("/api/auth/me").expect(200);
  });
});
