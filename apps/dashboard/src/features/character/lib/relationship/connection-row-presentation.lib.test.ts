import { describe, expect, it } from 'vitest'

import {
  resolveCharacterConnectionHref,
  resolveConnectionRowPresentation,
} from './connection-row-presentation.lib'
import type { CharacterPickerOption } from '../picker/character-picker-option.lib'

const campaignId = 'campaign-1'

describe('resolveCharacterConnectionHref', () => {
  const charactersById = new Map<string, CharacterPickerOption>([
    [
      'npc-1',
      {
        id: 'npc-1',
        name: 'Darius Vale',
        summary: 'Human fighter',
        characterType: 'npc',
        classIds: ['fighter'],
      },
    ],
    [
      'pc-1',
      {
        id: 'pc-1',
        name: 'Seraphina Vale',
        summary: 'Elf wizard',
        characterType: 'pc',
        classIds: ['wizard'],
      },
    ],
  ])

  it('links NPCs to the campaign NPC detail route', () => {
    expect(resolveCharacterConnectionHref(campaignId, 'npc-1', charactersById)).toBe(
      '/campaigns/campaign-1/npcs/npc-1',
    )
  })

  it('links PCs to the campaign character detail route', () => {
    expect(resolveCharacterConnectionHref(campaignId, 'pc-1', charactersById)).toBe(
      '/campaigns/campaign-1/characters/pc-1',
    )
  })
})

describe('resolveConnectionRowPresentation', () => {
  it('exposes a view href for person connections', () => {
    const charactersById = new Map<string, CharacterPickerOption>([
      [
        'npc-1',
        {
          id: 'npc-1',
          name: 'Darius Vale',
          summary: 'Human fighter',
          characterType: 'npc',
          classIds: ['fighter'],
        },
      ],
    ])

    const presentation = resolveConnectionRowPresentation({
      edge: {
        id: 'edge-1',
        kind: 'friendOf',
        characterId: '__new_character__',
        relatedCharacterId: 'npc-1',
      },
      campaignId,
      organizationsById: new Map(),
      locationsById: new Map(),
      charactersById,
    })

    expect(presentation.headingHref).toBe('/campaigns/campaign-1/npcs/npc-1')
    expect(presentation.canViewRecord).toBe(true)
  })
})
