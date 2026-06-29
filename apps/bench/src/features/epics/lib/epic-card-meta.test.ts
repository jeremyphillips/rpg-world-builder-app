import { describe, expect, it } from 'vitest'

import { sampleEpic } from '../test-fixtures'
import { buildEpicCardMetaById, resolveTicketEpicCardMeta } from './epic-card-meta'

describe('resolveTicketEpicCardMeta', () => {
  const epicMetaById = buildEpicCardMetaById([{ ...sampleEpic, badgeColor: '#2563eb' }])

  it('returns null when ticket has no epic', () => {
    expect(resolveTicketEpicCardMeta({ epicId: null }, epicMetaById)).toBeNull()
  })

  it('returns epic meta when found', () => {
    expect(resolveTicketEpicCardMeta({ epicId: sampleEpic.id }, epicMetaById)).toEqual({
      id: sampleEpic.id,
      title: sampleEpic.title,
      badgeColor: '#2563eb',
    })
  })

  it('returns unknown epic fallback when id is missing from lookup', () => {
    expect(resolveTicketEpicCardMeta({ epicId: 'missing-id' }, epicMetaById)).toEqual({
      id: 'missing-id',
      title: 'Unknown epic',
    })
  })
})
