import type { CodeRef, Ticket } from '@rpg/contracts/dev-bench'
import {
  getTicketPriorityLabel,
  getTicketSizeLabel,
  getTicketStatusLabel,
  getTicketTypeLabel,
} from '@rpg/contracts/dev-bench'

function formatCodeRef(ref: CodeRef): string {
  const parts = [ref.path]

  if (ref.symbol) {
    parts.push(`symbol: ${ref.symbol}`)
  }

  if (ref.lineStart !== undefined) {
    const end = ref.lineEnd ?? ref.lineStart
    parts.push(`lines: ${ref.lineStart}-${end}`)
  }

  if (ref.packageName) {
    parts.push(`package: ${ref.packageName}`)
  }

  if (ref.note) {
    parts.push(`note: ${ref.note}`)
  }

  return parts.join(', ')
}

function formatBulletList(items: string[]): string {
  if (items.length === 0) {
    return '_None_'
  }

  return items.map((item) => `- ${item}`).join('\n')
}

/** Stable markdown snapshot of an existing ticket for agent or human reading. */
export function formatTicketForAgent(ticket: Ticket): string {
  const lines = [
    `# ${ticket.key} — ${ticket.title}`,
    '',
    `- **Type:** ${getTicketTypeLabel(ticket.type)}`,
    `- **Status:** ${getTicketStatusLabel(ticket.status)}`,
    `- **Priority:** ${getTicketPriorityLabel(ticket.priority)}`,
    `- **Size:** ${getTicketSizeLabel(ticket.size)}`,
  ]

  if (ticket.area) {
    lines.push(`- **Area:** ${ticket.area}`)
  }

  if (ticket.epicId) {
    lines.push(`- **Epic ID:** ${ticket.epicId}`)
  }

  lines.push(
    '',
    '## Description',
    '',
    ticket.description ?? '_None_',
    '',
    '## Acceptance criteria',
    '',
  )

  lines.push(formatBulletList(ticket.acceptanceCriteria), '', '## Code references', '')

  lines.push(
    ticket.codeRefs.length > 0
      ? ticket.codeRefs.map((ref) => `- ${formatCodeRef(ref)}`).join('\n')
      : '_None_',
    '',
    '## Blocked by',
    '',
    formatBulletList(ticket.blockedByTicketIds),
    '',
    '## Related tickets',
    '',
    formatBulletList(ticket.relatedTicketIds),
  )

  return lines.join('\n')
}
