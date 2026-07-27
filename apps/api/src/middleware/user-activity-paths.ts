/** Paths that must not bump `lastActiveAt` when authenticated. */
export function shouldRecordUserActivity(originalUrl: string): boolean {
  const path = originalUrl.split('?')[0] ?? originalUrl
  if (path === '/api/health') return false
  if (path.startsWith('/api/auth')) return false
  if (path.startsWith('/api/bench')) return false
  return true
}
