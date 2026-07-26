import { CAMPAIGN_INVITE_EXPIRY_DAYS } from '@rpg/contracts'

export const CAMPAIGN_INVITE_ROTATION_COOLDOWN_MS = 60_000

export function normalizeInviteEmail(email: string): { email: string; normalizedEmail: string } {
  const normalizedEmail = email.trim().toLowerCase()
  return { email: normalizedEmail, normalizedEmail }
}

export function maskInvitedEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!local || !domain) return '***'
  const visible = local.slice(0, Math.min(1, local.length))
  return `${visible}***@${domain}`
}

export function computeInviteExpiresAt(now = new Date()): Date {
  const expiresAt = new Date(now)
  expiresAt.setDate(expiresAt.getDate() + CAMPAIGN_INVITE_EXPIRY_DAYS)
  return expiresAt
}

export function isInvitePastExpiry(expiresAt: string, now = new Date()): boolean {
  return new Date(expiresAt).getTime() <= now.getTime()
}
