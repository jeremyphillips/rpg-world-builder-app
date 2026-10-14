import { describe, expect, it } from 'vitest'

import { groupEntitySummaryStatusForMetadata } from './entity-summary-metadata-groups.lib'

describe('groupEntitySummaryStatusForMetadata', () => {
  it('groups consecutive badges and splits on text', () => {
    const segments = groupEntitySummaryStatusForMetadata([
      { kind: 'badge', label: 'Equipped', tone: 'success' },
      { kind: 'badge', label: 'Magical', tone: 'neutral' },
      { kind: 'text', variant: 'muted', label: 'Returning · +1 adjustment' },
    ])
    expect(segments).toEqual([
      {
        kind: 'badge-group',
        badges: [
          { kind: 'badge', label: 'Equipped', tone: 'success' },
          { kind: 'badge', label: 'Magical', tone: 'neutral' },
        ],
      },
      {
        kind: 'status',
        item: { kind: 'text', variant: 'muted', label: 'Returning · +1 adjustment' },
      },
    ])
  })

  it('does not merge badges separated by text', () => {
    const segments = groupEntitySummaryStatusForMetadata([
      { kind: 'badge', label: 'A', tone: 'success' },
      { kind: 'text', variant: 'muted', label: 'middle' },
      { kind: 'badge', label: 'B', tone: 'warning' },
    ])
    expect(segments).toHaveLength(3)
    expect(segments[0]?.kind).toBe('badge-group')
    expect(segments[2]?.kind).toBe('badge-group')
  })
})
