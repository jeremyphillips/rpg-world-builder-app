import { describe, expect, it } from 'vitest'

import { resolveLocationConnectedPartySubjectHref } from './resolve-location-connected-party-subject-href'

describe('resolveLocationConnectedPartySubjectHref', () => {
  it('routes organizations to organization detail', () => {
    expect(
      resolveLocationConnectedPartySubjectHref('camp-1', {
        type: 'organization',
        id: 'org-1',
        name: 'City Council',
        slug: 'council',
      }),
    ).toBe('/campaigns/camp-1/organizations/org-1')
  })

  it('routes campaign PCs to character detail', () => {
    expect(
      resolveLocationConnectedPartySubjectHref('camp-1', {
        type: 'character',
        id: 'char-1',
        name: 'Verna',
        slug: 'char-1',
        characterType: 'pc',
      }),
    ).toBe('/campaigns/camp-1/characters/char-1')
  })

  it('routes NPCs to npc detail', () => {
    expect(
      resolveLocationConnectedPartySubjectHref('camp-1', {
        type: 'character',
        id: 'npc-1',
        name: 'Durnan',
        slug: 'npc-1',
        characterType: 'npc',
      }),
    ).toBe('/campaigns/camp-1/npcs/npc-1')
  })
})
