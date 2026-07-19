import { describe, expect, it } from 'vitest'

import { pickSpell } from '@/features/content/lib/fixtures/pick'

import {
  createPopulatedStandaloneBuilderContextFixture,
  createStandaloneBuilderCatalogIndexFixture,
} from '../character-builder-fixtures'
import { SAMPLE_PC } from '../character-fixtures'
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
    const character = {
      ...SAMPLE_PC,
      equipment: {
        ...SAMPLE_PC.equipment,
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

    const [card] = buildCharacterSheetEquipmentCards(character, catalogIndex)
    expect(card?.id).toBe('weapon-row-1')
    expect(card?.displayName).toBe('Dagger')
  })

  it('distinguishes duplicate equipment without entryId by source signature and ordinal', () => {
    const sourceA = [{ kind: 'manual' as const }]
    const sourceB = [{ kind: 'startingGold' as const, sourceId: 'srd-cc-5.2.1:fighter' }]
    const character = {
      ...SAMPLE_PC,
      equipment: {
        ...SAMPLE_PC.equipment,
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

    const cards = buildCharacterSheetEquipmentCards(character, catalogIndex)
    expect(cards).toHaveLength(2)
    expect(cards[0]?.id).not.toBe(cards[1]?.id)
    expect(buildSourceSignature(sourceA)).not.toBe(buildSourceSignature(sourceB))
  })

  it('marks missing equipment references as unavailable', () => {
    const character = {
      ...SAMPLE_PC,
      equipment: {
        ...SAMPLE_PC.equipment,
        gear: [
          {
            equipmentId: 'missing:gear',
            quantity: 1,
            sources: [{ kind: 'manual' as const }],
          },
        ],
      },
    }

    const [card] = buildCharacterSheetEquipmentCards(character, catalogIndex)
    expect(card?.status).toBe('missing')
    expect(toEquipmentCatalogHeaderModel(card!).tone).toBe('unavailable')
    expect(toEquipmentCatalogHeaderModel(card!).unavailableMessage).toMatch(/unavailable/i)
  })

  it('builds spell cards with prepared metadata', () => {
    const spell = pickSpell('fire-bolt')
    const catalogIndexWithSpell = {
      ...catalogIndex,
      spells: new Map([...catalogIndex.spells, [spell.id, spell]]),
    }
    const character = {
      ...SAMPLE_PC,
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
          access: { classKnown: true },
          selection: { prepared: true },
        },
      ],
    }

    const [card] = buildCharacterSheetSpellCards(character, catalogIndexWithSpell)
    expect(card?.status).toBe('resolved')
    expect(toSpellCatalogHeaderModel(card!).footerLabels).toContain('Prepared')
  })
})
