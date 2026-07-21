import { describe, expect, it } from 'vitest'

import type { Equipment } from '../rpg/content/equipment'
import { indexCharacterBuildCatalog } from '../rpg/runtime/character-builder/context'
import { adaptDndBeyondCharacter } from './dnd-beyond/adapt-dnd-beyond-character'
import {
  dndBeyondCharacter133058471Payload,
  DND_BEYOND_FIXTURE_CHARACTER_ID,
} from './dnd-beyond/dnd-beyond-character-fixtures'
import { createDndBeyondEquipmentNameIndex } from './dnd-beyond/dnd-beyond-equipment-mapping'
import { createDndBeyondSpellNameIndex } from './dnd-beyond/dnd-beyond-spell-mapping'
import { DND_BEYOND_PAYLOAD_VERSION } from './dnd-beyond/dnd-beyond-version'
import { CharacterImportFinalizationError } from './character-import-finalization-error'
import { finalizeCharacterImport } from './finalize-character-import'
import { finalizeNpcCharacterImport } from './finalize-npc-character-import'

const fixtureAdaptOptions = {
  equipmentNameIndex: createDndBeyondEquipmentNameIndex([
    { name: 'Backpack', slug: 'backpack' },
    { name: "Calligrapher's Supplies", slug: 'calligraphers-supplies' },
    { name: 'Dagger', slug: 'dagger' },
    { name: 'Quarterstaff', slug: 'quarterstaff' },
    { name: 'Spellbook', slug: 'spellbook' },
    { name: 'Oil', slug: 'oil' },
    { name: 'Parchment', slug: 'parchment' },
    { name: 'Robe', slug: 'robe' },
    { name: 'Lamp', slug: 'lamp' },
    { name: 'Fine Clothes', slug: 'fine-clothes' },
  ]),
  spellNameIndex: createDndBeyondSpellNameIndex([
    { name: 'Light', slug: 'light' },
    { name: 'Mage Hand', slug: 'mage-hand' },
    { name: 'Ray of Frost', slug: 'ray-of-frost' },
    { name: 'Detect Magic', slug: 'detect-magic' },
    { name: 'Feather Fall', slug: 'feather-fall' },
    { name: 'Mage Armor', slug: 'mage-armor' },
    { name: 'Magic Missile', slug: 'magic-missile' },
    { name: 'Sleep', slug: 'sleep' },
    { name: 'Thunderwave', slug: 'thunderwave' },
  ]),
}

const fixtureSource = {
  provider: 'dnd-beyond' as const,
  payloadVersion: DND_BEYOND_PAYLOAD_VERSION,
  requestedPayloadVersion: DND_BEYOND_PAYLOAD_VERSION,
  supportedPayloadVersion: DND_BEYOND_PAYLOAD_VERSION,
  characterId: DND_BEYOND_FIXTURE_CHARACTER_ID,
  acquisition: 'public-id-fetch' as const,
}

const fixtureResult = adaptDndBeyondCharacter(
  dndBeyondCharacter133058471Payload,
  fixtureSource,
  fixtureAdaptOptions,
)

const dagger = {
  id: 'srd-cc-5.2.1:dagger',
  slug: 'dagger',
  rulesetId: 'srd-cc-5.2.1',
  name: 'Dagger',
  kind: 'weapon',
  category: 'simple',
} as Extract<Equipment, { kind: 'weapon' }>

const backpack = {
  id: 'srd-cc-5.2.1:backpack',
  slug: 'backpack',
  rulesetId: 'srd-cc-5.2.1',
  name: 'Backpack',
  kind: 'adventuring_gear',
} as Extract<Equipment, { kind: 'adventuring_gear' }>

const catalogIndex = indexCharacterBuildCatalog({
  classes: [],
  species: [],
  equipment: [dagger, backpack],
  spells: [],
  skillProficiencies: [],
  languages: [],
})

describe('finalizeCharacterImport', () => {
  it('maps adapted extraction to a standalone PC create input', () => {
    const input = finalizeCharacterImport(fixtureResult, {
      rulesetId: 'srd-cc-5.2.1',
      catalogIndex,
      defaultAlignment: 'n',
    })

    expect(input.characterType).toBe('pc')
    expect(input.campaignId).toBeNull()
    expect(input.name).toBe('Presto')
    expect(input.classes).toEqual([
      expect.objectContaining({ classId: 'srd-cc-5.2.1:wizard', level: 1 }),
    ])
    expect(input.species).toEqual({ id: 'srd-cc-5.2.1:human' })
    expect(input.alignment).toBe('n')
    expect(input.spells.length).toBeGreaterThan(0)
    expect(
      input.equipment.weapons.some((entry) => entry.equipmentId === 'srd-cc-5.2.1:dagger'),
    ).toBe(true)
  })

  it('throws when alignment is missing and no default is provided', () => {
    expect(() =>
      finalizeCharacterImport(fixtureResult, {
        rulesetId: 'srd-cc-5.2.1',
        catalogIndex,
      }),
    ).toThrow(CharacterImportFinalizationError)
  })
})

describe('finalizeNpcCharacterImport', () => {
  it('returns a CreateNpcRequestInput without ownership fields', () => {
    const input = finalizeNpcCharacterImport(fixtureResult, {
      rulesetId: 'srd-cc-5.2.1',
      catalogIndex,
      defaultAlignment: 'n',
    })

    expect(input).not.toHaveProperty('characterType')
    expect(input).not.toHaveProperty('campaignId')
    expect(input.name).toBe('Presto')
  })
})
