/** Per-user room used for recipient-scoped realtime fanout. */
export function userRoom(userId: string): string {
  return `user:${userId}`
}
