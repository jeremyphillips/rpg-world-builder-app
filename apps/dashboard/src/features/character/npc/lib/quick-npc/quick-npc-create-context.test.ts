import { describe, expect, it } from 'vitest'

import {
  mapContentCreateContextToQuickNpcCreateContext,
  QUICK_NPC_CREATE_SUBMIT_LABEL,
} from './quick-npc-create-context'

describe('mapContentCreateContextToQuickNpcCreateContext', () => {
  it('maps standalone content create context to standalone quick npc context', () => {
    expect(mapContentCreateContextToQuickNpcCreateContext({ kind: 'standalone' })).toEqual({
      kind: 'standalone',
    })
  })

  it('maps relationship-target content create context lossily to standalone quick npc context', () => {
    expect(
      mapContentCreateContextToQuickNpcCreateContext({
        kind: 'relationship-target',
        source: { contentType: 'organizations', id: 'org-1' },
        relationshipVocabulary: 'organization_location_connection',
      }),
    ).toEqual({ kind: 'standalone' })
  })
})

describe('QUICK_NPC_CREATE_SUBMIT_LABEL', () => {
  it('matches relationship picker auxiliary action label', () => {
    expect(QUICK_NPC_CREATE_SUBMIT_LABEL).toBe('Create NPC')
  })
})
