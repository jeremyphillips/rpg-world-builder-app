import jwt, { type SignOptions } from "jsonwebtoken";
import type { Role } from "@rpg/contracts";

import { loadEnv } from "../env";

/** Claims we put in the session JWT. Kept minimal; everything else is looked up. */
export interface SessionClaims {
  sub: string;
  role: Role;
}

export function signSessionToken(claims: SessionClaims): string {
  const env = loadEnv();
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"] };
  return jwt.sign(claims, env.JWT_SECRET, options);
}

/** Verify and decode a session token. Returns null on any failure (expired/tampered). */
export function verifySessionToken(token: string): SessionClaims | null {
  const env = loadEnv();
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (typeof decoded === "string" || !decoded.sub || typeof decoded.sub !== "string") {
      return null;
    }
    return { sub: decoded.sub, role: (decoded as { role: Role }).role };
  } catch {
    return null;
  }
}
