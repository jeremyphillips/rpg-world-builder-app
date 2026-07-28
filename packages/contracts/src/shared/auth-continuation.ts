const AUTH_CONTINUATION_ALLOWED_PREFIXES = ['/campaign-invites/'] as const

export type AuthContinuationAllowedPrefix = (typeof AUTH_CONTINUATION_ALLOWED_PREFIXES)[number]

/** Same-origin relative paths only — rejects protocol-relative and off-origin URLs. */
export function validateAuthContinuationPath(returnTo: string | null | undefined): string | null {
  if (!returnTo) return null

  const trimmed = returnTo.trim()
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return null
  }

  const isAllowed = AUTH_CONTINUATION_ALLOWED_PREFIXES.some((prefix) => trimmed.startsWith(prefix))
  if (!isAllowed) {
    return null
  }

  return trimmed
}

export function buildAuthContinuationUrl(
  authPath: '/login' | '/signup',
  returnTo: string,
  options?: { email?: string },
): string {
  const params = new URLSearchParams({ returnTo })
  if (options?.email) {
    params.set('email', options.email)
  }
  return `${authPath}?${params.toString()}`
}

export function extractCampaignInviteTokenFromPath(path: string): string | null {
  const match = path.match(/^\/campaign-invites\/([^/?#]+)/)
  return match?.[1] ?? null
}
