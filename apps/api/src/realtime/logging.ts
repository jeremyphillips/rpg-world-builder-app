/** Structured logging for realtime auth and delivery failures (best-effort; never throws). */

export function logRealtimeAuthFailure(reason: string, error?: unknown): void {
  if (error instanceof Error) {
    console.warn(`[realtime] socket auth rejected (${reason}):`, error.message)
    return
  }
  console.warn(`[realtime] socket auth rejected (${reason})`)
}

export function logRealtimeDeliveryFailure(
  context: { userId: string; event: string },
  error: unknown,
): void {
  console.error('[realtime] delivery failed', {
    userId: context.userId,
    event: context.event,
    error: error instanceof Error ? error.message : error,
  })
}

export function logRealtimeAdapterInfo(message: string): void {
  console.log(`[realtime] ${message}`)
}
