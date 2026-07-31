import type { DirectMessage } from '@rpg/contracts'

import { groupMessagesByTime, type MessageTimeGroup } from './group-messages-by-time.lib'

export type MessageThreadDateSeparatorSegment = {
  type: 'date-separator'
  timestamp: string
}

export type MessageThreadGroupSegment = {
  type: 'message-group'
  group: MessageTimeGroup
}

export type MessageThreadSegment = MessageThreadDateSeparatorSegment | MessageThreadGroupSegment

function localCalendarDayKey(value: string): string {
  const date = new Date(value)
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

export function buildMessageThreadSegments(messages: DirectMessage[]): MessageThreadSegment[] {
  const groups = groupMessagesByTime(messages)
  const segments: MessageThreadSegment[] = []
  let lastSeparatorDayKey: string | null = null

  for (const group of groups) {
    const dayKey = localCalendarDayKey(group.timestamp)
    if (dayKey !== lastSeparatorDayKey) {
      segments.push({ type: 'date-separator', timestamp: group.timestamp })
      lastSeparatorDayKey = dayKey
    }

    segments.push({ type: 'message-group', group })
  }

  return segments
}
