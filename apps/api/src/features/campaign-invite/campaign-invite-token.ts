import { createHash, randomBytes } from 'node:crypto'

/** Generates a raw invite token for in-memory use only — never persist or log. */
export function generateInviteToken(): string {
  return randomBytes(32).toString('hex')
}

/** Deterministic SHA-256 hash for indexed invite-token lookup. */
export function hashInviteToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex')
}
