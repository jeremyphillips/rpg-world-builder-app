import { describe, expect, it } from 'vitest'

import type { ClassStored } from '../../../../content/classes/class'
import { equipmentSchema } from '../../../../content/equipment'
import { createEmptyCharacterBuilderDraft } from '../../draft/draft'
import { indexCharacterBuildCatalog } from '../../context'
import { startingEquipmentChoiceSetId } from './resolve-starting-equipment-choice-sets'
import {
  deriveEquipmentDraftEntries,
  inventoryContainsEquipmentId,
} from './derive-equipment-draft-entries'
import { ensureEquipmentGrant } from './ensure-equipment-grant'

const RULESET = 'srd-cc-5.2.1' as const

const longsword = equipmentSchema.parse({
  id: `${RULESET}:longsword`,
  slug: 'longsword',
  rulesetId: RULESET,
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Longsword',
  description: '',
  cost: { amount: 15, currency: 'gp' },
  weight: { value: 3, unit: 'lb' },
  kind: 'weapon',
  category: 'martial',
  mode: 'melee',
  damage: { dice: { count: 1, faces: 8 } },
  damageType: 'slashing',
  properties: [],
  mastery: 'sap',
})

const goldOnlyClass: ClassStored = {
  id: `${RULESET}:gold-only`,
  slug: 'gold-only',
  rulesetId: RULESET,
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Gold Only',
  primaryAbilities: ['str'],
  hitDie: 10,
  proficiencies: {
    savingThrows: ['str', 'con'],
    armor: { categories: [], items: [] },
    weapons: { categories: ['simple', 'martial'], items: [] },
    skills: { categories: [], items: [] },
  },
  features: [],
  characterCreation: {
    startingEquipment: {
      choose: 1,
      options: [{ id: 'starting-gold', label: 'Starting Gold', items: [], wealth: { gp: 0 } }],
    },
  },
}

const catalogIndex = indexCharacterBuildCatalog({
  species: [],
  classes: [goldOnlyClass],
  spells: [],
  equipment: [longsword],
  skillProficiencies: [],
  organizations: [],
  languages: [],
})

describe('ensureEquipmentGrant', () => {
  it('upserts ensure-at-least quantity on the draft grant channel', () => {
    const draft = createEmptyCharacterBuilderDraft()
    const first = ensureEquipmentGrant({
      draft,
      equipmentId: longsword.id,
      quantity: 1,
      catalogIndex,
    })
    expect(first.ok).toBe(true)
    if (!first.ok) return

    const second = ensureEquipmentGrant({
      draft: first.draft,
      equipmentId: longsword.id,
      quantity: 3,
      catalogIndex,
    })
    expect(second.ok).toBe(true)
    if (!second.ok) return

    expect(second.draft.equipment?.grants).toEqual([{ equipmentId: longsword.id, quantity: 3 }])
    expect(second.draft.equipment?.purchases).toEqual([])
  })

  it('rejects equipment missing from catalog index', () => {
    const result = ensureEquipmentGrant({
      draft: createEmptyCharacterBuilderDraft(),
      equipmentId: `${RULESET}:missing`,
      quantity: 1,
      catalogIndex,
    })
    expect(result).toEqual({ ok: false, reason: 'equipment_not_in_catalog' })
  })

  it('assembles inventory at zero funds without purchase rows', () => {
    const baseDraft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: goldOnlyClass.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(goldOnlyClass.id)]: ['starting-gold'],
      },
      equipment: {
        mode: 'gold' as const,
        purchases: [],
        grants: [],
        removedPackageItemKeys: [],
        customized: false,
      },
    }

    const granted = ensureEquipmentGrant({
      draft: baseDraft,
      equipmentId: longsword.id,
      quantity: 1,
      catalogIndex,
    })
    expect(granted.ok).toBe(true)
    if (!granted.ok) return

    const inventory = deriveEquipmentDraftEntries(granted.draft, catalogIndex)
    expect(inventoryContainsEquipmentId(inventory, longsword.id)).toBe(true)
    expect(granted.draft.equipment?.purchases).toEqual([])
    expect(granted.draft.equipment?.grants).toEqual([{ equipmentId: longsword.id, quantity: 1 }])
  })

  it('does not couple to purchase affordability planners', async () => {
    expect(Object.keys(await import('./ensure-equipment-grant'))).toEqual(['ensureEquipmentGrant'])
  })
})
