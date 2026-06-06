import type { CookieOptions, Response } from "express";

import { loadEnv } from "../env";

export const SESSION_COOKIE = "rpg_session";
export const CSRF_COOKIE = "rpg_csrf";
export const CSRF_HEADER = "x-csrf-token";

const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const CSRF_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Shared cookie attributes. The single-origin proxy lets us use host-only
 * cookies (no `Domain`) with `SameSite=Lax`; `Secure` is enabled outside dev.
 */
function baseCookieOptions(): CookieOptions {
  const { isProduction } = loadEnv();
  return {
    sameSite: "lax",
    secure: isProduction,
    path: "/",
  };
}

/** httpOnly session cookie holding the JWT. Never readable by client JS. */
export function setSessionCookie(res: Response, token: string): void {
  res.cookie(SESSION_COOKIE, token, {
    ...baseCookieOptions(),
    httpOnly: true,
    maxAge: SESSION_MAX_AGE_MS,
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE, { ...baseCookieOptions(), httpOnly: true });
}

/**
 * CSRF cookie for the double-submit pattern. Intentionally NOT httpOnly so the
 * client can read it and echo the value back in the `x-csrf-token` header.
 */
export function setCsrfCookie(res: Response, token: string): void {
  res.cookie(CSRF_COOKIE, token, {
    ...baseCookieOptions(),
    httpOnly: false,
    maxAge: CSRF_MAX_AGE_MS,
  });
}
