import { describe, expect, it } from 'vitest'

import {
  mapContentCreateContextToQuickNpcCreateContext,
  QUICK_NPC_CREATE_SUBMIT_LABEL,
  type QuickNpcCreateContext,
} from './quick-npc-create-context'
import { quickNpcOrganizationMemberCreateContext } from './quick-npc-test-fixtures'

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

describe('organization-member QuickNpcCreateContext entry path', () => {
  it('preserves organization-member context passed from org roster (not via ContentCreateContext map)', () => {
    const context = quickNpcOrganizationMemberCreateContext()
    const roundTrip: QuickNpcCreateContext = context

    expect(roundTrip).toEqual(context)
    expect(mapContentCreateContextToQuickNpcCreateContext({ kind: 'standalone' })).not.toEqual(
      context,
    )
  })
})

describe('QUICK_NPC_CREATE_SUBMIT_LABEL', () => {
  it('matches relationship picker auxiliary action label', () => {
    expect(QUICK_NPC_CREATE_SUBMIT_LABEL).toBe('Create NPC')
  })
})
