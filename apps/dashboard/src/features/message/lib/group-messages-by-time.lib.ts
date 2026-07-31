import type { DirectMessage } from '@rpg/contracts'

/** Consecutive same-sender bubbles within this window share one timestamp row. */
export const MESSAGE_GROUP_MAX_GAP_MS = 5 * 60 * 1000

export type MessageTimeGroup = {
  senderUserId: string
  messages: DirectMessage[]
  /** ISO timestamp of the last message in the group — used for the group label. */
  timestamp: string
}

function messageTimestampMs(message: DirectMessage): number {
  return new Date(message.createdAt).getTime()
}

function isSameLocalCalendarDay(left: string, right: string): boolean {
  const leftDate = new Date(left)
  const rightDate = new Date(right)
  return (
    leftDate.getFullYear() === rightDate.getFullYear() &&
    leftDate.getMonth() === rightDate.getMonth() &&
    leftDate.getDate() === rightDate.getDate()
  )
}

export function groupMessagesByTime(messages: DirectMessage[]): MessageTimeGroup[] {
  const groups: MessageTimeGroup[] = []

  for (const message of messages) {
    const previousGroup = groups.at(-1)
    const previousMessage = previousGroup?.messages.at(-1)
    const canJoinGroup =
      previousGroup !== undefined &&
      previousMessage !== undefined &&
      previousGroup.senderUserId === message.senderUserId &&
      isSameLocalCalendarDay(message.createdAt, previousMessage.createdAt) &&
      messageTimestampMs(message) - messageTimestampMs(previousMessage) <= MESSAGE_GROUP_MAX_GAP_MS

    if (canJoinGroup && previousGroup) {
      previousGroup.messages.push(message)
      previousGroup.timestamp = message.createdAt
      continue
    }

    groups.push({
      senderUserId: message.senderUserId,
      messages: [message],
      timestamp: message.createdAt,
    })
  }

  return groups
}
