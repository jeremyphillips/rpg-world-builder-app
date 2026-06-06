import type { Request, Response } from "express";
import type { LoginInput, RegisterInput } from "@rpg/contracts";

import { setCsrfCookie, setSessionCookie, clearSessionCookie } from "../../lib/cookies";
import { generateCsrfToken } from "../../lib/csrf";
import { signSessionToken } from "../../lib/jwt";
import { toSessionUser } from "../user";
import { authenticateUser, registerUser } from "./auth.service";

export async function register(req: Request, res: Response): Promise<void> {
  const user = await registerUser(req.body as RegisterInput);
  res.status(201).json({ user: toSessionUser(user) });
}

export async function login(req: Request, res: Response): Promise<void> {
  const user = await authenticateUser(req.body as LoginInput);
  const token = signSessionToken({ sub: user.id, role: user.role });
  setSessionCookie(res, token);

  // Refresh the double-submit CSRF token so the client holds one post-login.
  const csrfToken = generateCsrfToken();
  setCsrfCookie(res, csrfToken);

  res.status(200).json({ user: toSessionUser(user), csrfToken });
}

export function logout(_req: Request, res: Response): void {
  clearSessionCookie(res);
  res.status(200).json({ ok: true });
}

export function me(req: Request, res: Response): void {
  res.status(200).json({ user: req.user });
}

export function csrf(_req: Request, res: Response): void {
  const csrfToken = generateCsrfToken();
  setCsrfCookie(res, csrfToken);
  res.status(200).json({ csrfToken });
}
