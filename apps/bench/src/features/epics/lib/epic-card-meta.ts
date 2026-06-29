import type { Epic, Ticket } from '@rpg/contracts/dev-bench'

export type EpicCardMeta = Pick<Epic, 'id' | 'title' | 'badgeColor'>

export function buildEpicCardMetaById(epics: Epic[]): Map<string, EpicCardMeta> {
  return new Map(
    epics.map((epic) => [epic.id, { id: epic.id, title: epic.title, badgeColor: epic.badgeColor }]),
  )
}

/** Returns null when the ticket has no epic; otherwise meta from lookup or an unknown epic fallback. */
export function resolveTicketEpicCardMeta(
  ticket: Pick<Ticket, 'epicId'>,
  epicMetaById: Map<string, EpicCardMeta>,
): EpicCardMeta | null {
  if (!ticket.epicId) return null

  return (
    epicMetaById.get(ticket.epicId) ?? {
      id: ticket.epicId,
      title: 'Unknown epic',
    }
  )
}

export function toEpicCardMeta(epic: Epic): EpicCardMeta {
  return { id: epic.id, title: epic.title, badgeColor: epic.badgeColor }
}
