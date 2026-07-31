/** Builds the canonical sorted participant pair key for direct conversations. */
export function buildDirectConversationParticipantKey(userIdA: string, userIdB: string): string {
  const [left, right] = [userIdA, userIdB].sort()
  return `${left}:${right}`
}

export function buildDirectConversationParticipantIds(
  userIdA: string,
  userIdB: string,
): [string, string] {
  const sorted = [userIdA, userIdB].sort()
  return [sorted[0]!, sorted[1]!]
}
