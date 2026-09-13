import { describe, expect, it } from 'vitest'

import {
  projectVisibleHeritageOptions,
  projectVisibleSpeciesTraits,
} from './species-display-projection'

describe('projectVisibleSpeciesTraits', () => {
  it('hides traits that are locally available but species-unavailable', () => {
    const traits = [{ id: 't1', kind: 'custom' as const, name: 'Darkvision', available: true }]
    const visible = projectVisibleSpeciesTraits(traits, {
      speciesAccess: {
        available: false,
        visibilityMode: 'all_players',
        participantIds: [],
        unavailableParticipantIds: [],
        effectiveAudience: 'none',
      },
    })

    expect(visible).toEqual([])
  })

  it('hides traits marked unavailable on the body row', () => {
    const traits = [{ id: 't1', kind: 'custom' as const, name: 'Darkvision', available: false }]
    const visible = projectVisibleSpeciesTraits(traits, {
      speciesAccess: {
        available: true,
        visibilityMode: 'all_players',
        participantIds: [],
        unavailableParticipantIds: [],
        effectiveAudience: 'all_players',
      },
    })

    expect(visible).toEqual([])
  })
})

describe('projectVisibleHeritageOptions', () => {
  it('keeps locally available options visible when only species narrows at runtime', () => {
    const options = [
      {
        id: 'o1',
        kind: 'custom' as const,
        name: 'High Elf',
        campaignAccess: {
          available: true,
          visibilityMode: 'all_players' as const,
          participantIds: [],
        },
      },
    ]

    const visible = projectVisibleHeritageOptions(options, {
      speciesAccess: {
        available: true,
        visibilityMode: 'all_players',
        participantIds: [],
        unavailableParticipantIds: [],
        effectiveAudience: 'all_players',
      },
    })

    expect(visible).toHaveLength(1)
  })

  it('hides heritage options when species is unavailable', () => {
    const options = [
      {
        id: 'o1',
        kind: 'custom' as const,
        name: 'High Elf',
        campaignAccess: {
          available: true,
          visibilityMode: 'all_players' as const,
          participantIds: [],
        },
      },
    ]

    const visible = projectVisibleHeritageOptions(options, {
      speciesAccess: {
        available: false,
        visibilityMode: 'all_players',
        participantIds: [],
        unavailableParticipantIds: [],
        effectiveAudience: 'none',
      },
    })

    expect(visible).toEqual([])
  })
})
