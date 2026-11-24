import { systemDefaultArmorClassRules } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { pickEquipment, pickSpell } from '@/features/content'

import {
  createPopulatedStandaloneBuilderContextFixture,
  createStandaloneBuilderCatalogIndexFixture,
  standaloneEquipmentReferenceScope,
} from '../fixtures/character-builder-fixtures'
import { makePcCharacter } from '../fixtures/character-fixtures'
import {
  buildCharacterSheetEquipmentCards,
  buildCharacterSheetSpellCards,
  buildSourceSignature,
  toEquipmentCatalogHeaderModel,
  toSpellCatalogHeaderModel,
} from './character-sheet-catalog'

const context = createPopulatedStandaloneBuilderContextFixture()
const catalogIndex = createStandaloneBuilderCatalogIndexFixture(context)

describe('character-sheet-catalog', () => {
  it('uses entryId when present for stable equipment occurrence identity', () => {
    const dagger = pickEquipment('dagger')
    const catalogWithDagger = {
      ...catalogIndex,
      equipment: new Map([...catalogIndex.equipment, [dagger.id, dagger]]),
    }
    const character = {
      ...makePcCharacter(),
      equipment: {
        ...makePcCharacter().equipment,
        weapons: [
          {
            entryId: 'weapon-row-1',
            equipmentId: 'srd-cc-5.2.1:dagger',
            quantity: 1,
            sources: [{ kind: 'manual' as const }],
          },
        ],
      },
    }

    const [card] = buildCharacterSheetEquipmentCards(
      character,
      catalogWithDagger,
      systemDefaultArmorClassRules(),
      standaloneEquipmentReferenceScope,
    )
    expect(card?.id).toBe('weapon-row-1')
    expect(card?.displayName).toBe('Dagger')
  })

  it('distinguishes duplicate equipment without entryId by source signature and ordinal', () => {
    const sourceA = [{ kind: 'manual' as const }]
    const sourceB = [{ kind: 'startingGold' as const, sourceId: 'srd-cc-5.2.1:fighter' }]
    const character = {
      ...makePcCharacter(),
      equipment: {
        ...makePcCharacter().equipment,
        weapons: [
          {
            equipmentId: 'srd-cc-5.2.1:dagger',
            quantity: 1,
            sources: sourceA,
          },
          {
            equipmentId: 'srd-cc-5.2.1:dagger',
            quantity: 1,
            sources: sourceB,
          },
        ],
      },
    }

    const cards = buildCharacterSheetEquipmentCards(
      character,
      catalogIndex,
      systemDefaultArmorClassRules(),
      standaloneEquipmentReferenceScope,
    )
    expect(cards).toHaveLength(2)
    expect(cards[0]?.id).not.toBe(cards[1]?.id)
    expect(buildSourceSignature(sourceA)).not.toBe(buildSourceSignature(sourceB))
  })

  it('preserves explicit equipment scope when the equipment catalog is empty', () => {
    const emptyIndex = {
      ...catalogIndex,
      equipment: new Map(),
    }
    const character = {
      ...makePcCharacter(),
      equipment: {
        ...makePcCharacter().equipment,
        gear: [
          {
            equipmentId: 'missing:gear',
            quantity: 1,
            sources: [{ kind: 'manual' as const }],
          },
        ],
      },
    }

    const scope = { rulesetId: 'srd-cc-5.2.1', campaignId: 'campaign-a' }
    const [card] = buildCharacterSheetEquipmentCards(
      character,
      emptyIndex,
      systemDefaultArmorClassRules(),
      scope,
    )

    expect(card?.displayName).toMatch(/unavailable/i)
    expect(card?.status).toBe('missing')
  })

  it('marks missing equipment references as unavailable', () => {
    const character = {
      ...makePcCharacter(),
      equipment: {
        ...makePcCharacter().equipment,
        gear: [
          {
            equipmentId: 'missing:gear',
            quantity: 1,
            sources: [{ kind: 'manual' as const }],
          },
        ],
      },
    }

    const [card] = buildCharacterSheetEquipmentCards(
      character,
      catalogIndex,
      systemDefaultArmorClassRules(),
      standaloneEquipmentReferenceScope,
    )
    expect(card?.status).toBe('missing')
    expect(toEquipmentCatalogHeaderModel(card!, systemDefaultArmorClassRules()).tone).toBe(
      'unavailable',
    )
    expect(
      toEquipmentCatalogHeaderModel(card!, systemDefaultArmorClassRules()).unavailableMessage,
    ).toMatch(/unavailable/i)
  })

  it('builds spell cards with prepared metadata', () => {
    const spell = pickSpell('fire-bolt')
    const catalogIndexWithSpell = {
      ...catalogIndex,
      spells: new Map([...catalogIndex.spells, [spell.id, spell]]),
    }
    const character = {
      ...makePcCharacter(),
      spells: [
        {
          spellId: spell.id,
          sources: [
            {
              kind: 'classSpellcasting' as const,
              sourceId: 'srd-cc-5.2.1:wizard',
              grantId: 'cantrips',
            },
          ],
          access: {},
          collections: [{ kind: 'prepared' as const }],
        },
      ],
    }

    const [card] = buildCharacterSheetSpellCards(character, catalogIndexWithSpell)
    expect(card?.status).toBe('resolved')
    expect(toSpellCatalogHeaderModel(card!).footerLabels).toContain('Prepared')
  })
})
